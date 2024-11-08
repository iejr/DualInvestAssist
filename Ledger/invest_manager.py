import os
from model import Ledger
from serializer import saveData, loadData


class RecordManager:
    def __init__(self, filename="records.json"):
        self.records = []
        self.filename = filename
        # Load records if the file exists
        if os.path.exists(self.filename):
            self.load_from_disk()

    def run(self):
        """Run the event loop."""
        while True:
            print("\nPlease choose an action:")
            print("1. Show current program state")
            print("2. Add a new record")
            print("3. Save to disk")
            print("4. Exit")
            choice = input("Enter your choice: ")

            if choice == "1":
                self.show_state()
            elif choice == "2":
                self.add_record()
            elif choice == "3":
                self.save_to_disk()
            elif choice == "4":
                print("Exiting the program.")
                break
            else:
                print("Invalid choice, please try again.")


if __name__ == "__main__":
    ledger = Ledger("Token")

    ledger.addNewPurchase(100, 20)
    ledger.addNewSellPlan("plan 1", 101, 20)

    ledger.addNewPurchase(50, 20)
    ledger.addNewSellPlan("plan 2", 50, 10)

    ledger.addNewPurchase(150, 20)
    ledger.addNewSellPlan("plan 3", 200, 10)
    ledger.addNewSellPlan("plan 4", 75, 10)

    ledger.addNewPurchase(150, 20)
    ledger.addNewSellPlan("plan 5", 150, 20)

    ledger.finishPlan("plan 1", True)
    ledger.finishPlan("plan 3", False)

    ledger2 = Ledger("Token2")
    ledger2.addNewPurchase(5, 500)

    saveData([ledger.toDict(), ledger2.toDict()], "temp.yaml")
    ledger_raw = loadData("temp.yaml")
    print(ledger_raw)

    ledgers = [Ledger.fromDict(ledger) for ledger in ledger_raw]
    print(ledgers)
