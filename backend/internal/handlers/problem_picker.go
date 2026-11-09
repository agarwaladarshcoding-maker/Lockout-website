package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

type ProblemPickerRequest struct {
	ChallengerId       string `json:"challenger_id"`
	OpponentId         string `json:"opponent_id"`
	ChallengerUsername string `json:"challenger_username"`
	OpponentUsername   string `json:"opponent_username"`
	StartScore         int    `json:"start_score"`
	NumProblems        int    `json:"num_problems"`
	Tiebreaker         bool   `json:"tiebreaker"`
}

type ProblemPickerResponse struct {
	Problems []Problem `json:"problems"`
}

type Problem struct {
	ProblemId         string   `json:"problem_id"`
	ProblemName       string   `json:"problem_name"`
	ProblemDifficulty string   `json:"problem_difficulty"`
	ProblemTags       []string `json:"problem_tags"`
	ProblemUrl        string   `json:"problem_url"`
}

type CFProblemDetail struct {
	ContestID int      `json:"contestId"`
	Index     string   `json:"index"`
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	Rating    int      `json:"rating"`
	Tags      []string `json:"tags"`
}

type CFProblemsetResponse struct {
	Status  string `json:"status"`
	Comment string `json:"comment"`
	Result  struct {
		Problems []CFProblemDetail `json:"problems"`
	} `json:"result"`
}

func (h *AuthHandler) HandleProblemPicker(w http.ResponseWriter, r *http.Request) {
	var req ProblemPickerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	player1Cf := strings.TrimSpace(req.ChallengerUsername)
	player2Cf := strings.TrimSpace(req.OpponentUsername)

	// If IDs were provided and handles are empty, attempt to resolve handles from userStore
	if player1Cf == "" && req.ChallengerId != "" {
		if id, err := strconv.Atoi(req.ChallengerId); err == nil {
			if u, err := h.userStore.GetUserByID(r.Context(), id); err == nil && u != nil {
				player1Cf = u.CodeforcesHandle
			}
		}
	}
	if player2Cf == "" && req.OpponentId != "" {
		if id, err := strconv.Atoi(req.OpponentId); err == nil {
			if u, err := h.userStore.GetUserByID(r.Context(), id); err == nil && u != nil {
				player2Cf = u.CodeforcesHandle
			}
		}
	}

	// Also check if username was sent instead of handle, and resolve to CodeforcesHandle
	if player1Cf != "" {
		if u, err := h.userStore.GetUserByUsername(r.Context(), player1Cf); err == nil && u != nil && u.CodeforcesHandle != "" {
			player1Cf = u.CodeforcesHandle
		}
	}
	if player2Cf != "" {
		if u, err := h.userStore.GetUserByUsername(r.Context(), player2Cf); err == nil && u != nil && u.CodeforcesHandle != "" {
			player2Cf = u.CodeforcesHandle
		}
	}

	client := &http.Client{Timeout: 15 * time.Second}
	solvedProblemSet := make(map[string]bool)

	// Helper to fetch user submissions and record all accepted problems
	fetchSolved := func(handle string) {
		if handle == "" {
			return
		}
		statusURL := fmt.Sprintf("https://codeforces.com/api/user.status?handle=%s", url.QueryEscape(handle))
		httpReq, err := http.NewRequestWithContext(r.Context(), http.MethodGet, statusURL, nil)
		if err != nil {
			return
		}
		httpReq.Header.Set("User-Agent", "Lockout-Web/1.0 (Competitive Programming Lockout Platform)")

		resp, err := client.Do(httpReq)
		if err != nil || resp.StatusCode != http.StatusOK {
			return
		}
		defer resp.Body.Close()

		var statusResp CFStatusResponse
		if err := json.NewDecoder(resp.Body).Decode(&statusResp); err == nil && statusResp.Status == "OK" {
			for _, sub := range statusResp.Result {
				if sub.Verdict == "OK" {
					cID := sub.Problem.ContestID
					if cID == 0 {
						cID = sub.ContestID
					}
					if cID > 0 && sub.Problem.Index != "" {
						key := fmt.Sprintf("%d%s", cID, sub.Problem.Index)
						solvedProblemSet[key] = true
					}
				}
			}
		}
	}

	// 1. Collect accepted problems for both players
	fetchSolved(player1Cf)
	fetchSolved(player2Cf)

	// 2. Fetch all problems from Codeforces problemset
	cfReq, err := http.NewRequestWithContext(r.Context(), http.MethodGet, "https://codeforces.com/api/problemset.problems", nil)
	if err != nil {
		http.Error(w, "Failed to create Codeforces request", http.StatusInternalServerError)
		return
	}
	cfReq.Header.Set("User-Agent", "Lockout-Web/1.0 (Competitive Programming Lockout Platform)")

	cfResp, err := client.Do(cfReq)
	if err != nil {
		http.Error(w, "Error fetching Codeforces problems", http.StatusInternalServerError)
		return
	}
	defer cfResp.Body.Close()

	if cfResp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("Codeforces API error: status %d", cfResp.StatusCode), http.StatusBadGateway)
		return
	}

	var allProblems CFProblemsetResponse
	if err := json.NewDecoder(cfResp.Body).Decode(&allProblems); err != nil || allProblems.Status != "OK" {
		http.Error(w, "Failed to parse Codeforces problems list", http.StatusInternalServerError)
		return
	}

	// 3. Filter problems between startScore and startScore + 500 that neither player solved
	startScore := req.StartScore
	if startScore <= 0 {
		startScore = 800
	}
	maxScore := startScore + 500

	numProblems := req.NumProblems
	if numProblems <= 0 {
		numProblems = 5
	}
	if req.Tiebreaker {
		numProblems++
	}

	ratingToProblems := make(map[int][]CFProblemDetail)
	var allEligible []CFProblemDetail

	for _, p := range allProblems.Result.Problems {
		if p.ContestID <= 0 || p.Index == "" || p.Rating < startScore || p.Rating > maxScore {
			continue
		}

		// Exclude interactive problems per Lockout standard rules
		isInteractive := false
		for _, tag := range p.Tags {
			if strings.EqualFold(tag, "interactive") {
				isInteractive = true
				break
			}
		}
		if isInteractive {
			continue
		}

		key := fmt.Sprintf("%d%s", p.ContestID, p.Index)
		if solvedProblemSet[key] {
			continue
		}

		ratingToProblems[p.Rating] = append(ratingToProblems[p.Rating], p)
		allEligible = append(allEligible, p)
	}

	if len(allEligible) == 0 {
		http.Error(w, "No unsolved problems found in the rating range", http.StatusNotFound)
		return
	}

	// 4. Select problems across increasing rating tiers (startScore, startScore+100, ..., startScore+500)
	rGen := rand.New(rand.NewSource(time.Now().UnixNano()))
	selectedKeys := make(map[string]bool)
	var picked []CFProblemDetail

	for i := 0; i < numProblems; i++ {
		targetRating := startScore + (i * 100)
		if targetRating > maxScore {
			targetRating = maxScore
		}

		pool := ratingToProblems[targetRating]
		if len(pool) > 0 {
			rGen.Shuffle(len(pool), func(a, b int) { pool[a], pool[b] = pool[b], pool[a] })
			for _, p := range pool {
				key := fmt.Sprintf("%d%s", p.ContestID, p.Index)
				if !selectedKeys[key] {
					selectedKeys[key] = true
					picked = append(picked, p)
					break
				}
			}
		}
	}

	// If any rating buckets lacked available problems, fill from remaining eligible problems
	if len(picked) < numProblems {
		rGen.Shuffle(len(allEligible), func(a, b int) { allEligible[a], allEligible[b] = allEligible[b], allEligible[a] })
		for _, p := range allEligible {
			key := fmt.Sprintf("%d%s", p.ContestID, p.Index)
			if !selectedKeys[key] {
				selectedKeys[key] = true
				picked = append(picked, p)
				if len(picked) == numProblems {
					break
				}
			}
		}
	}

	// Sort selected problems in ascending order of rating (100-pt to 500-pt)
	sort.Slice(picked, func(i, j int) bool {
		return picked[i].Rating < picked[j].Rating
	})

	var responseProblems []Problem
	for _, p := range picked {
		responseProblems = append(responseProblems, Problem{
			ProblemId:         fmt.Sprintf("%d%s", p.ContestID, p.Index),
			ProblemName:       p.Name,
			ProblemDifficulty: strconv.Itoa(p.Rating),
			ProblemTags:       p.Tags,
			ProblemUrl:        fmt.Sprintf("https://codeforces.com/problemset/problem/%d/%s", p.ContestID, p.Index),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(ProblemPickerResponse{
		Problems: responseProblems,
	})
}
