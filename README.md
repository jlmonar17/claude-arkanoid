# Juego de Arkanoid

Este es un juego de Arkanoid que corre en el navegador, desarrollado con HTML, Canvas 2D y JavaScript (sin dependencias ni build). El objetivo es destruir todos los bloques con una bola que rebota en una pala controlada por el jugador.

## Cómo ejecutarlo

Sirve la raíz del repositorio con un servidor estático y abre la página en el navegador. Por ejemplo:

```bash
python3 -m http.server 8000
```

Luego abre <http://localhost:8000>.

No abras `index.html` directamente con `file://`: el navegador puede bloquear la carga del atlas de sprites (`assets/spritesheet-breakout.png`).

## Controles

- **Mover la pala:** ratón (sigue la posición del cursor) o teclado (flechas izquierda/derecha, o `A`/`D`). Manda el último input usado.
- **Lanzar la bola:** clic o barra espaciadora.
- **Siguiente nivel** (en la pantalla "Nivel completado"): clic o barra espaciadora.
- **Reiniciar** (tras ganar o perder): clic o barra espaciadora. Se vuelve al nivel 1.
- **Pausa:** `P` o `Escape` alternan pausa y reanudación, solo mientras la bola está en juego.
- **Saltar de nivel:** teclas `1` a `5`, en cualquier momento (útil para probar). Conserva puntaje y vidas; desde la victoria o el game over empieza una partida nueva en ese nivel.

## Reglas

- 5 niveles de 7 filas × 10 columnas, cada uno con un layout distinto. Los bloques se rompen de un golpe.
- La bola es un 10 % más rápida en cada nivel: 360, 396, 432, 468 y 504 px/s.
- 10 puntos por bloque roto.
- 3 vidas: si la bola cae por debajo de la pala, pierdes una vida. Puntaje y vidas se conservan entre niveles; perder una vida no restaura bloques.
- Ganas al completar el nivel 5 (255 bloques, 2550 puntos sin perder vidas); pierdes al quedarte sin vidas.
- Suena `ball-bounce.mp3` al rebotar en la pala, las paredes o el techo, y `break-sound.mp3` al romper un bloque.

## Estructura

- `index.html`: página con el `<canvas>` de 800 × 600.
- `game.js`: lógica del juego.
- `assets/`: atlas de sprites (`spritesheet-breakout.png`), su mapa de coordenadas (`spritesheet.js`) y sonidos (`sounds/ball-bounce.mp3`, `sounds/break-sound.mp3`).
- `specs/`: especificaciones del proyecto.
