from model import Ledger
from serializer import saveData, loadData

if __name__ == '__main__':
    ledger = Ledger("Token")

    ledger.addNewPurchase(100, 20)
    ledger.addNewSellPlan('plan 1', 101, 20)

    ledger.addNewPurchase(50, 20)
    ledger.addNewSellPlan('plan 2', 50, 10)

    ledger.addNewPurchase(150, 20)
    ledger.addNewSellPlan('plan 3', 200, 10)
    ledger.addNewSellPlan('plan 4', 75, 10)

    ledger.addNewPurchase(150, 20)
    ledger.addNewSellPlan('plan 5', 150, 20)

    ledger.finishPlan('plan 1', True)
    ledger.finishPlan('plan 3', False)

    ledger2 = Ledger("Token2")
    ledger2.addNewPurchase(5, 500)

    saveData([ledger.toDict(), ledger2.toDict()], 'temp.yaml')
    ledger_raw = loadData('temp.yaml')
    print(ledger_raw)

    ledgers = [Ledger.fromDict(ledger) for ledger in ledger_raw]
    print(ledgers)
