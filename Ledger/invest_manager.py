import os
import sys
from model import Ledger
from serializer import saveData, loadData


class InvestManager:

    model_file: str
    ledgers: dict

    def __init__(self, filename="ledger.yaml"):
        self.model_file = filename
        self.ledgers = {}
        self.loadLedgers()

    def loadLedgers(self):
        # Load records if the file exists
        if os.path.exists(self.model_file):
            ledgers_list = [
                Ledger.fromDict(ledger) for ledger in loadData(self.model_file)
            ]
            self.ledgers = {ledger.getSymbol(): ledger for ledger in ledgers_list}
        else:
            print(f"Ledger file {self.model_file} not exist, create empty one")

    def saveLedgers(self):
        saveData([ledger.toDict() for ledger in self.ledgers.values()], self.model_file)

    def showLedger(self, symbol=""):
        if symbol == "":
            for symbol, ledger in self.ledgers.items():
                print(f"Show {symbol} => ")
                print(f"\t{ledger}")
        elif symbol in self.ledgers.keys():
            print(f"Show {symbol} => ")
            print(f"\t{self.ledgers[symbol]}")

    def getTotalAvailableAmount(self, symbol, price):
        if not symbol in self.ledgers.keys():
            raise KeyError(f"Symbol {symbol} not found in all ledgers")

        return self.ledgers[symbol].getAvailableAmountLessOrEqualThan(price)

    def addNewLedger(self, symbol):
        if symbol in self.ledgers.keys():
            raise KeyError(f"Failed to add the new {symbol}, already exist")
        self.ledgers[symbol] = Ledger(symbol)
        self.saveLedgers()

    def removeLedger(self, symbol):
        if not symbol in self.ledgers.keys():
            raise KeyError(f"Failed to delete {symbol}, not exist")
        del self.ledgers[symbol]
        self.saveLedgers()

    def addNewPurchase(self, symbol, target_price, amount):
        if not symbol in self.ledgers.keys():
            raise KeyError(f"Symbol {symbol} not found in all ledgers")

        self.ledgers[symbol].addNewPurchase(target_price, amount)
        self.saveLedgers()

    def addNewSellPlan(self, symbol, plan_name, target_price, take_amount):
        if not symbol in self.ledgers.keys():
            raise KeyError(f"Symbol {symbol} not found in all ledgers")

        self.ledgers[symbol].addNewSellPlan(plan_name, target_price, take_amount)
        self.saveLedgers()

    def finishPlan(self, symbol, plan_name, sold):
        if not symbol in self.ledgers.keys():
            raise KeyError(f"Symbol {symbol} not found in all ledgers")

        self.ledgers[symbol].finishPlan(plan_name, sold)

        if self.ledgers[symbol].getTotalAmount() == 0:
            self.removeLedger(symbol)
        self.saveLedgers()


def main(args):
    manager = InvestManager()

    action = args[0]
    if action == "show":
        symbol = args[1] if len(args) > 1 else ""
        manager.showLedger(symbol)
    elif action == "check-amount":
        if len(args) < 3:
            print(
                "Incorrect arguments! Usage: python invest_manager.py check-amount symbol price"
            )
            return
        symbol = args[1]
        price = args[2]
        amount = manager.getTotalAvailableAmount(symbol, price)
        print(f"There are {amount} shares of {symbol} was bought under or equal to {price}")
    elif action == "add-ledger":
        if len(args) < 2:
            print(
                "Incorrect arguments! Usage: python invest_manager.py add-ledger symbol"
            )
            return
        symbol = args[1]
        manager.addNewLedger(symbol)
        print("Successfully add the new empty ledger")
    elif action == "add-purchase":
        if len(args) < 3:
            print(
                "Incorrect arguments! Usage: python invest_manager.py add-purchase symbol price amount"
            )
            return
        symbol = args[1]
        price = args[2]
        amount = args[3]
        manager.addNewPurchase(symbol, price, amount)
        print("Successfully add purchase record to the ledger")
    elif action == "add-sellhigh":
        if len(args) < 4:
            print(
                "Incorrect arguments! Usage: python invest_manager.py add-sellhigh symbol plan_name price amount"
            )
            return
        symbol = args[1]
        plan_name = args[2]
        price = args[3]
        amount = args[4]
        if manager.addNewSellPlan(symbol, plan_name, price, amount):
            print("Successfully add the new sell high plan to the ledger")
        else:
            print("Failed to add the new sell high plan to the ledger")
    elif action == "sold-plan":
        if len(args) < 3:
            print(
                "Incorrect arguments! Usage: python invest_manager.py sold-plan symbol plan_name"
            )
            return
        symbol = args[1]
        plan_name = args[2]
        manager.finishPlan(symbol, plan_name, True)
        print(f"Successfully close plan {plan_name} as sold")
    elif action == "close-plan":
        if len(args) < 3:
            print(
                "Incorrect arguments! Usage: python invest_manager.py close-plan symbol plan_name"
            )
            return
        symbol = args[1]
        plan_name = args[2]
        manager.finishPlan(symbol, plan_name, False)
        print(f"Successfully close plan {plan_name} as not-sold")
    elif action == "remove-ledger":
        if len(args) < 2:
            print(
                "Incorrect arguments! Usage: python invest_manager.py remove-ledger symbol"
            )
            return
        symbol = args[1]
        manager.removeLedger(symbol)
        print(f"Successfully removed the ledger")
    else:
        raise SyntaxError(f"Action {args[0]} is not supported")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python invest_manager.py action arg1 arg2 ...")
        exit(1)

    args = sys.argv[1:]
    main(args)
    # ledger = Ledger("Token")

    # ledger.addNewPurchase(100, 20)
    # ledger.addNewSellPlan("plan 1", 101, 20)

    # ledger.addNewPurchase(50, 20)
    # ledger.addNewSellPlan("plan 2", 50, 10)

    # ledger.addNewPurchase(150, 20)
    # ledger.addNewSellPlan("plan 3", 200, 10)
    # ledger.addNewSellPlan("plan 4", 75, 10)

    # ledger.addNewPurchase(150, 20)
    # ledger.addNewSellPlan("plan 5", 150, 20)

    # ledger.finishPlan("plan 1", True)
    # ledger.finishPlan("plan 3", False)

    # ledger2 = Ledger("Token2")
    # ledger2.addNewPurchase(5, 500)

    # saveData([ledger.toDict(), ledger2.toDict()], "temp.yaml")
    # ledger_raw = loadData("temp.yaml")
    # print(ledger_raw)

    # ledgers = [Ledger.fromDict(ledger) for ledger in ledger_raw]
    # print(ledgers)
