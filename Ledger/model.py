from bisect import bisect_left


class SellManager:
    total: int
    taken: int
    detail: list

    def __init__(self, amount=0):
        self.total = amount
        self.taken = 0
        self.detail = []

    def getAvailableAmount(self) -> int:
        return self.total - self.taken

    def getDetails(self) -> list:
        return self.detail

    def __repr__(self) -> str:
        return f"[total: {self.total} | taken: {self.taken} | detail: {self.detail}]"

    def checkAvailableAmount(self, new_amount) -> bool:
        return self.getAvailableAmount() >= new_amount

    def addAmount(self, num):
        self.total += num

    def addTaken(self, plan_name, new_amount) -> bool:
        if self.checkAvailableAmount(new_amount):
            self.detail.append((plan_name, new_amount))
            self.taken += new_amount
            return True

        return False

    def removeTaken(self, plan_name, sold):
        back = 0
        for idx in range(0, len(self.detail)):
            (k, v) = self.detail[idx]
            if k == plan_name:
                back = v
                self.taken -= v
                if sold:
                    self.total -= v
                del self.detail[idx]
                break
        return back


class Ledger:
    symbol: str
    total_amount: int
    total_taken: int
    data: list[int, SellManager]

    def __init__(self, symbol):
        self.symbol = symbol
        self.total_amount = 0
        self.total_taken = 0
        self.data = []

    def getTotalAmount(self) -> int:
        return self.total_amount

    def getTotalTaken(self) -> int:
        return self.total_taken

    def getPriceList(self) -> list:
        return [x for x in self.data.keys()]

    def _getPriceFromData(self, data):
        return data[0]

    def _getSellManagerFromData(self, data):
        return data[1]

    def __repr__(self) -> str:
        show = f"symbol: {self.symbol} | amount: {self.total_amount} | taken: {self.total_taken} | detail: \n"
        for k, v in self.data:
            show += f"\t{k} => " + str(v) + "\n"
        return show

    def getGreatestPricePosLessThan(self, target_price) -> int:
        # Extract keys for binary search
        prices = [k for k, v in self.data]

        # Find the index of the target key
        idx = bisect_left(prices, target_price)

        return idx

    def getAvailableAmountLessOrEqualThan(self, target_price) -> list:
        boundary = self.getGreatestPricePosLessThan(target_price)

        detail = []
        for i in range(0, boundary + 1):
            if i >= len(self.data):
                break
            detail.append(
                [
                    self._getPriceFromData(self.data[i]),
                    self._getSellManagerFromData(self.data[i]).getAvailableAmount(),
                ]
            )

        return detail

    def addNewPurchase(self, target_price, amount):
        boundary = self.getGreatestPricePosLessThan(target_price)
        if boundary < len(self.data) and target_price == self._getPriceFromData(
            self.data[boundary]
        ):
            self._getSellManagerFromData(self.data[boundary]).addAmount(amount)
        else:
            self.data.insert(boundary, [target_price, SellManager(amount)])

        self.total_amount += amount

    def addNewSellPlan(self, name, target_price, take_amount) -> bool:
        boundary = self.getGreatestPricePosLessThan(target_price)
        it = min(boundary, len(self.data) - 1)

        while it >= 0 and take_amount > 0:
            manager = self._getSellManagerFromData(self.data[it])
            deduct_amount = min(manager.getAvailableAmount(), take_amount)

            if deduct_amount == 0:
                pass
            elif manager.addTaken(name, deduct_amount):
                take_amount -= deduct_amount
                self.total_taken += deduct_amount
            else:
                print(
                    f"Failed to update plan for price {self._getPriceFromData(self.data[it])}"
                )
                return False
            it -= 1

        return True

    def finishPlan(self, name, sold):
        total_change = 0
        for k, v in self.data:
            total_change += v.removeTaken(name, sold)
        
        if sold:
            self.total_amount -= total_change
        self.total_taken -= total_change


if __name__ == "__main__":
    ledger = Ledger("Token")
    print(ledger)

    ledger.addNewPurchase(100, 20)
    print(ledger)

    ledger.addNewSellPlan('plan 1', 101, 20)
    print(ledger)

    ledger.addNewPurchase(50, 20)
    print(ledger)
    ledger.addNewSellPlan('plan 2', 50, 10)
    print(ledger)

    ledger.addNewPurchase(150, 20)
    ledger.addNewSellPlan('plan 3', 200, 10)
    ledger.addNewSellPlan('plan 4', 75, 10)
    print(ledger)

    ledger.addNewPurchase(150, 20)
    ledger.addNewSellPlan('plan 5', 150, 20)
    print(ledger)

    ledger.finishPlan('plan 1', True)
    print(ledger)

    ledger.finishPlan('plan 3', False)
    print(ledger)

    ledger.finishPlan('plan 2', True)
    ledger.finishPlan('plan 4', True)
    print(ledger)