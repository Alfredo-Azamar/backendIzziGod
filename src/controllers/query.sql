SELECT 
    L.Asunto, L.Sentiment, L.Notas, L.IdLlamada,
    Cliente.Nombre AS CName, Cliente.ApellidoP AS CLastName, Cliente.Celular,
    Zona.Nombre AS ZoneName, 
    Empleado.Nombre, Empleado.ApellidoP, 
    Contrato.Fecha, Paquete.Nombre AS PName, Paquete.Precio,
    (SELECT COUNT(*) FROM Llamada AS Llamadas WHERE Llamadas.IdEmpleado = Empleado.IdEmpleado) AS numLlamadas 
FROM Empleado
LEFT JOIN Llamada AS L ON L.IdEmpleado = Empleado.IdEmpleado AND L.FechaHora = (
        SELECT MAX(L2.FechaHora) 
        FROM Llamada AS L2 
        WHERE L2.IdEmpleado = Empleado.IdEmpleado)
LEFT JOIN Cliente ON L.Celular = Cliente.Celular
LEFT JOIN Zona ON Cliente.IdZona = Zona.IdZona
LEFT JOIN Contrato ON Cliente.Celular = Contrato.Celular
LEFT JOIN Paquete ON Contrato.IdPaquete = Paquete.IdPaquete  
ORDER BY Empleado.IdEmpleado;
