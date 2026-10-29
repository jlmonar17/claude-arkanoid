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
- **Reiniciar** (tras ganar o perder): clic o barra espaciadora.

## Reglas

- Un nivel de 7 filas × 10 columnas de bloques, que se rompen de un golpe.
- 10 puntos por bloque roto.
- 3 vidas: si la bola cae por debajo de la pala, pierdes una vida.
- Ganas al romper los 70 bloques; pierdes al quedarte sin vidas.

## Estructura

- `index.html`: página con el `<canvas>` de 800 × 600.
- `game.js`: lógica del juego.
- `assets/`: atlas de sprites (`spritesheet-breakout.png`), su mapa de coordenadas (`spritesheet.js`) y sonidos (sin usar todavía).
- `specs/`: especificaciones del proyecto.
