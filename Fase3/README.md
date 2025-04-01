# Instrucciones:
## División de trabajos:
- Maqueta: Afinación de detalles, autenticación y conexión MQTT. (Diego)
- AWS Face rekognition API: Implementación e instrucciones de uso. (Daniel)
- Dashboard local: Graficación de datos en tiempo real y envío a las BD en la nube. (Bruce)
- Grafana: Graficación de los datos guardados en la BD y api que predice datos. (Natalia) 
> [!IMPORTANT] 
> Es importante que comenten su código para hacer la documentación posteriormente.
## Arquitectura propuesta:
```mermaid
graph TD;
    A[Arduino] -- Serial --> B[Raspberry Pi];
    A --> W[Sensores/Actuadores];
    subgraph Raspberry
        style Raspberry fill:#ff666680,stroke:#000;
        B -- MQTT --> C[Broker MQTT en Raspberry Pi];
        C -- Publica/Suscribe --> B;
        C -- MQTT --> D[API en Raspberry Pi];
        subgraph Dashboard
            style Dashboard fill:#66ccff80,stroke:#000;
            D -- Autenticación --> E[Usuarios];
            D -- Grafica datos en tiempo real --> F[Dashboard en Raspberry Pi];
        end
    end
    D -- Envía comandos --> A;
    C -- MQTT --> G[Servicio en la Nube];
    subgraph Nube
        style Nube fill:#99ff9980,stroke:#000;
        AWS[Rekognition] -- Response --> E;
        E -- post --> AWS;
        G[Servicio en la Nube] --> H[Base de Datos en la Nube];
        H --> I[Grafana];
    end
    
    %% Estilos de color
    classDef arduino fill:#ffcc00,stroke:#000,color:#000,font-weight:bold,font-size:14px;
    classDef raspberry fill:#ff6666,stroke:#000,color:#fff,font-weight:bold,font-size:14px;
    classDef dashboard fill:#66ccff,stroke:#000,color:#000,font-weight:bold,font-size:14px;
    classDef nube fill:#99ff99,stroke:#000,color:#000,font-weight:bold,font-size:14px;
    classDef aws fill:#ff9900,stroke:#000,color:#000,font-weight:bold,font-size:14px;
    
    class A,W arduino;
    class B,C raspberry;
    class D,E,F dashboard;
    class G,H,I nube;
    class AWS aws;
```
## ¿Cómo hacer commits?
Rama de esta fase: develop-fase2.
- Se generará una rama develop-fase2
- De esa rama generarán otras ramas de uso propio.
- El nombre de esa rama será el suyo propio + feature. Ejemplo: diego-api1
- Probarémos cada cosa de manera individual y en la fase final haremos merge a la rama develop-fase2.
```mermaid
gitGraph
  commit
  commit
  branch develop-fase2
  checkout develop-fase2
  commit
  commit
  branch diego-api1
  checkout diego-api1
  commit
  commit
  checkout develop-fase2
  merge diego-api1
  commit
  commit
  checkout main
  merge develop-fase2
```
