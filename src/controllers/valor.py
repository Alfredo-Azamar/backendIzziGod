def valorar():
    negativo =  5
    positivo =  10
    neutral = 5
    suma = negativo * -1 + positivo * 1 + neutral * 0
    cant = negativo + positivo + neutral
    resultado = (suma / cant) + 1
    final = (resultado * 100) / 2
    return final

print(valorar())