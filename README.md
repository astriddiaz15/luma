# LUMA — dispositivo físico-digital

Prototipo de LUMA: una app web (HTML/CSS/JS, sin build) conectada por **Web Serial** a un
**Arduino Uno** con un sensor ultrasónico **HC-SR04**, un LED verde y una tira **NeoPixel**.

Cuando el usuario acerca la mano a ~3 cm:

1. el LED verde se apaga,
2. a los **2 s** se enciende la tira blanca **10 s**,
3. la app navega a **Track 2** (felicitación), suma **+1** a la racha y vuelve a **Track**.

Además, al vincular el dispositivo el LED verde hace **3 destellos** de confirmación.

## Estructura

```
index.html              app (carga los módulos con ?v=)
js/                     lógica: router, pantallas, datos, Web Serial
css/                    estilos
assets/                 ilustraciones y tipografías de la app
luma_device/            firmware de trabajo (Arduino Uno)
sensor funciona/        firmware listo para cargar (mismo código)
IDO/                    versión original del sketch, sin puente serial
figma-renders/          exports de Figma usados como referencia
Imagenes Figma/         material de diseño
_tmp/                   capturas de comparación (scratch)
```

## Cómo correr la app

No necesita instalación ni build; es estático. Desde la carpeta del proyecto:

```bash
python -m http.server 8080
```

y abrir `http://127.0.0.1:8080/?debug=1#/track`
(el `?debug=1` muestra la caja de diagnóstico con los mensajes del enlace serial).

Requiere **Chrome o Edge** (Web Serial) y servir por `http://localhost` o `127.0.0.1`
(Web Serial no funciona en `file://`).

## Hardware

| Elemento | Pin |
|---|---|
| HC-SR04 TRIG | 8 |
| HC-SR04 ECHO | 9 |
| LED verde | 5 |
| Tira NeoPixel (1 píxel) | 6 |

- Distancia de detección: **3.0 cm** · rearme al alejarse a **> 6 cm**
- Secuencia sin `delay()` bloqueantes: verde → 2 s → blanco 10 s → verde
- Comandos seriales (9600 baudios): `LUMA_LINK` (3 destellos), `LUMA_PING` → `LUMA_ALIVE`
- Eventos que envía la placa: `SISTEMA INICIADO`, `Distancia: X cm`, `OBJETO DETECTADO A 3 CM`

## Firmware

`luma_device/luma_device.ino` (o la copia `sensor funciona/sensor funciona.ino`) se abre con
**Arduino IDE 2.x** y requiere la librería **Adafruit NeoPixel**. Compila para `arduino:avr:uno`.

> El monitor serial de Arduino IDE y la app **no pueden usar el puerto COM a la vez**:
> cerrá el monitor antes de vincular desde la web.

## Notas

- El progreso (rutinas, racha, calendario) se guarda en `localStorage`, separado por perfil.
- El calendario de demostración arranca el **15 de febrero de 2026** y avanza con cada rutina.
- Sin el parámetro `?debug=1` no se muestra ninguna caja de diagnóstico.

## Licencia

Uso educativo / prototipo. Las ilustraciones y tipografías provienen de los diseños de Figma
del proyecto.
