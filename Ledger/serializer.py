import yaml


def saveData(data, filename = "data.yaml"):
    with open(filename, 'w') as fout:
        yaml.dump(data, fout)

def loadData(filename = "data.yaml"):
    with open(filename, 'r') as fin:
        return yaml.load(fin, Loader=yaml.SafeLoader)


if __name__ == '__main__':
    testdata = {'a': '123', 'b': '456', 'c': [[1, 2], [4, 6]]}
    saveData(testdata, 'temp.yaml')

    testdata = loadData('temp.yaml')
    print(testdata)
