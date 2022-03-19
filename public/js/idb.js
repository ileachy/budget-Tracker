let db;

const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;

  db.createObjectStore("budget_tracker", { autoIncrement: true });
};

request.onsuccess = function (event) {
  const db = event.target.result;

  if (navigator.onLine) {
    loadBudget();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["budget_tracker"], "readwrite");
  const budgetObjectStore = transaction.objectStore("budget_tracker");
  budgetObjectStore.add(record);
}

function loadBudget() {
  const transaction = db.transaction(["budget_tracker"], "readwrite");
  const budgetObjectStore = transaction.objectStore("budget_tracker");
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["budget_tracker"], "readwrite");
          const budgetObjectStore = transaction.objectStore("budget_tracker");
          budgetObjectStore.clear();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", loadBudget);
