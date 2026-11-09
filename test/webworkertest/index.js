const result = document.getElementById("result");

// Worker code as a string (in-memory)
const workerScript = `
  (function loop() {
    setTimeout(async () => {
      try {
        const res = await fetch("https://codeforces.com/api/user.status?handle=AdarshAg&from=1&count=10");
        const data = await res.json();
        postMessage(data);
      } catch (err) {
        console.error("Worker fetch error:", err);
      }
      loop();
    }, 3000);
  })();
`;

// Convert the string into a Blob URL
const blob = new Blob([workerScript], { type: "application/javascript" });
const myWorker = new Worker(URL.createObjectURL(blob));

myWorker.onmessage = (e) => {
  if (result) {
    result.textContent = JSON.stringify(e.data, null, 2);
  }
  const time = Date.now();
  console.log("Message received from worker", e.data, " ", time);
};
