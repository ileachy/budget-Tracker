let db;

const req = indexedDB.open("budget-tracker", 1);

req.onupgradeneeded = function (event) {
  const db = event.target.result;

  db.createObjectStore("budget_tracker", { autoIncrement: true });
};

req.onsuccess = function (event) {
  const db = event.target.result;

  if (navigator.onLine) {
    loadBudget();
  }
};

req.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["budget_tracker"], "readwrite");
  const budgetObjStore = transaction.objectStore("budget_tracker");
  budgetObjStore.add(record);
}

function loadBudget() {
  const transaction = db.transaction(["budget_tracker"], "readwrite");
  const budgetObjStore = transaction.objectStore("budget_tracker");
  const getAllBudg = budgetObjStore.getAllBudg();

  getAllBudg.onsuccess = function () {
    if (getAllBudg.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAllBudg.result),
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
          const budgetObjStore = transaction.objectStore("budget_tracker");
          budgetObjStore.clear();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", loadBudget);
