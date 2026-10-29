# SPEC 01 — MVP jugable de Arkanoid en el navegador

> **Estado:** Borrador
> **Depende de:** ninguno
> **Fecha:** 2026-10-29
> **Objetivo:** Un Arkanoid jugable en el navegador (HTML + Canvas + JS), con un único nivel de 7 filas de bloques, 3 vidas, 10 puntos por bloque y pala controlada a la vez con ratón y teclado.

## Por qué existe este spec

El README habla de Pygame, pero `assets/spritesheet.js` es JavaScript de navegador (Canvas 2D). Este spec cierra esa ambigüedad a favor del navegador. Por eso incluye corregir el README para que describa el stack real.

## Alcance

**Dentro:**

- Página `index.html` con un `<canvas>` de **800 × 600** que carga `assets/spritesheet.js` y `game.js` con `<script>` simples, sin módulos ni build.
- Un único nivel: 7 filas × 10 columnas de bloques, una fila por color (`red`, `cyan`, `green`, `magenta`, `yellow`, `hotpink`, `gray`). Todos se rompen de 1 golpe.
- Pala controlada **a la vez** con ratón (sigue la X del cursor) y teclado (flechas izquierda/derecha y `A`/`D`). Gana el último input usado.
- Bola que empieza pegada a la pala y se lanza con clic o barra espaciadora.
- Colisiones de la bola con paredes, techo, pala y bloques. El rebote en la pala depende del punto de impacto.
- Puntaje: 10 puntos por bloque roto, sin nada más.
- 3 vidas. Si la bola cae por abajo se pierde una vida y la bola vuelve a la pala.
- HUD dibujado en el canvas con puntaje y vidas.
- Pantalla de victoria (todos los bloques rotos) y de game over (0 vidas), ambas en el canvas con el puntaje final. Se reinicia con clic o barra espaciadora.
- Los bloques rotos simplemente desaparecen.
- Actualizar el README para describir el stack real y cómo ejecutar el juego.

**Fuera de alcance (para specs futuros):**

- Sonidos: no se usa ningún audio en este MVP (`assets/sounds/*` queda sin usar).
- Animación de explosión (`EXPLOSION_FRAMES`, `EXPLOSION_DURATION`): el bloque desaparece sin animación.
- Power-ups.
- Varios niveles o progresión.
- Récords o persistencia (`localStorage`).
- Control táctil o versión móvil.
- Pausa, menú de inicio y bloques de varios golpes.
- Modo de dos jugadores.

## Modelo de datos

Estructuras nuevas en `game.js`, todas en memoria. No hay persistencia.

```js
const CANVAS_W = 800;
const CANVAS_H = 600;

const BLOCK_COLORS = ['red', 'cyan', 'green', 'magenta', 'yellow', 'hotpink', 'gray']; // de arriba abajo
const GRID = { rows: 7, cols: 10, blockW: 68, blockH: 24, gap: 4, offsetX: 42, offsetY: 60 };
const POINTS_PER_BLOCK = 10;
const INITIAL_LIVES = 3;

const state = {
  phase: 'ready',        // 'ready' | 'playing' | 'won' | 'gameover'
  score: 0,
  lives: INITIAL_LIVES,
  paddle: { x, y: 560, w: 120, h: 14, speed: 600 },    // x = borde izquierdo, speed en px/s
  ball: { x, y, r: 8, vx: 0, vy: 0, speed: 360 },      // x,y = centro, velocidades en px/s
  blocks: [/* { x, y, w, h, color, alive } */],
  input: { lastSource: 'mouse', mouseX: 400, left: false, right: false },
};
```

Convenciones:

- Origen arriba a la izquierda; Y crece hacia abajo.
- Se usa un bucle con `requestAnimationFrame` y `dt` en segundos, limitado a un máximo de 0,05 s para evitar saltos.
- La X del ratón se convierte a coordenadas del canvas con `getBoundingClientRect()`, para que funcione aunque el canvas se escale por CSS.
- Los sprites se dibujan con `drawSprite(ctx, 'paddle' | 'ball' | 'block_<color>', x, y, w, h)` y solo después de `loadSpritesheet`.
- Rebote en la pala: el ángulo respecto a la vertical va de −60° (borde izquierdo) a +60° (borde derecho). La rapidez de la bola se mantiene constante.

## Plan de implementación

1. Crear `index.html` con el `<canvas width="800" height="600">`, un fondo oscuro y los `<script>` de `assets/spritesheet.js` y `game.js`. Crear `game.js` con el bucle `requestAnimationFrame`. Prueba manual: servir desde la raíz del repo y ver el canvas vacío sin errores en consola.
2. Cargar el sprite sheet con `loadSpritesheet` y dibujar la cuadrícula de 7 × 10 bloques con `drawSprite`. Prueba: se ven 7 filas de colores distintos.
3. Dibujar la pala y moverla con el ratón y el teclado (último input gana, pala limitada a los bordes del canvas). Prueba: ambos controles mueven la pala sin pelearse.
4. Añadir la bola pegada a la pala en fase `ready`, lanzarla con clic o espacio y moverla con rebote en paredes y techo. Prueba: la bola rebota y no sale por los lados ni por arriba.
5. Añadir el rebote en la pala según el punto de impacto. Prueba: la bola sale más inclinada cerca de los bordes de la pala.
6. Añadir la colisión con bloques (el bloque pasa a `alive = false`, rebote según el eje de impacto) y sumar 10 puntos por bloque. Prueba: los bloques desaparecen y el puntaje sube de 10 en 10.
7. Gestionar las vidas: la bola que cae vuelve a la pala en `ready` y resta una vida. Dibujar el HUD con puntaje y vidas. Prueba: tras 3 caídas aparece `gameover`.
8. Añadir las pantallas de `won` y `gameover` con el puntaje final y el reinicio con clic o espacio, que restablece bloques, puntaje y vidas. Prueba: se puede jugar varias partidas seguidas.
9. Actualizar el README para describir el stack real (navegador), cómo servir el juego desde la raíz del repo y los controles. Actualizar también la sección de estado de `CLAUDE.md`.

## Criterios de aceptación

- [ ] Al abrir el juego servido desde la raíz del repo, la consola no muestra errores.
- [ ] El canvas mide exactamente 800 × 600 píxeles.
- [ ] Al empezar hay 70 bloques (7 filas × 10 columnas), una fila por cada color de `BLOCK_COLORS`.
- [ ] Mover el ratón mueve la pala hacia la X del cursor.
- [ ] Mantener flecha izquierda/derecha (o `A`/`D`) mueve la pala.
- [ ] Usar ratón y teclado alternadamente no produce saltos ni bloqueos: manda el último input usado.
- [ ] La pala nunca sale del canvas por ninguno de los dos controles.
- [ ] En fase `ready`, la bola sigue a la pala y no se mueve sola.
- [ ] Clic o barra espaciadora lanzan la bola hacia arriba.
- [ ] La bola rebota en las paredes laterales y en el techo.
- [ ] El rebote en la pala sale hacia la izquierda si golpea la mitad izquierda y hacia la derecha si golpea la mitad derecha.
- [ ] Al tocar un bloque, este desaparece sin animación y el puntaje sube exactamente 10.
- [ ] Si la bola cae por debajo del canvas, las vidas bajan en 1 y la bola vuelve a la pala en `ready`.
- [ ] El HUD muestra siempre el puntaje y las vidas, empezando en 0 y 3.
- [ ] Con 0 vidas aparece "Game Over" con el puntaje final.
- [ ] Al romper los 70 bloques aparece el mensaje de victoria con 700 puntos.
- [ ] Desde las pantallas de victoria y game over, clic o espacio reinician con 70 bloques, 0 puntos y 3 vidas.
- [ ] No se reproduce ningún sonido en todo el juego.
- [ ] El README describe el stack de navegador y cómo ejecutar el juego.

## Decisiones tomadas y descartadas

- **Sí:** navegador con HTML + Canvas + JS. Reutiliza `assets/spritesheet.js` sin cambios y no requiere dependencias ni build.
- **No:** Pygame. Obligaría a reescribir el cargador de sprites y dejaría `spritesheet.js` sin uso.
- **Sí:** ratón y teclado simultáneos, con el último input como ganador. Evita conflictos entre ambos sin añadir modos ni configuración.
- **No:** sumar el teclado al desplazamiento del ratón. Se siente errático.
- **Sí:** lanzar la bola con clic o espacio. Es coherente con ratón + teclado y el mismo control reinicia la partida.
- **Sí:** 7 filas, una por color, de 1 golpe. Aprovecha los 7 colores del atlas con la lógica más simple posible.
- **Sí:** puntaje fijo de 10 por bloque y 3 vidas. Es la regla mínima pedida para el MVP.
- **Sí:** un único nivel. La progresión de niveles merece su propio spec.
- **No:** sonidos ni animación de explosión. El usuario los dejó fuera de este MVP; los assets existen y se pueden activar en un spec posterior.
- **Sí:** mensajes de victoria y game over dibujados en el canvas. Sin botones HTML ni elementos fuera del canvas.
- **Sí:** `index.html` + `game.js`. Es suficiente para un MVP y evita sobreorganizar.
- **No:** varios archivos JS ni todo inline. Lo primero es excesivo hoy y lo segundo es más difícil de mantener.

## Riesgos identificados

| Riesgo                                                                       | Mitigación                                                                                           |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Abrir `index.html` con `file://` puede bloquear la carga del PNG (canvas contaminado) | Servir desde la raíz del repo con un servidor estático; documentarlo en el README.                   |
| La bola atraviesa bloques o la pala a `dt` grande                            | Limitar `dt` a 0,05 s y mover la bola en subpasos si hace falta.                                     |
| La bola se queda en un bucle horizontal sin bajar                            | Garantizar una componente vertical mínima en la velocidad tras cada rebote.                          |
| `drawSprite` no hace nada hasta que carga el atlas                           | Iniciar el bucle de juego dentro del callback de `loadSpritesheet`.                                  |

## Lo que **no** está en este spec

- Sonidos y música.
- Animación de explosión de bloques.
- Power-ups.
- Varios niveles.
- Récords y persistencia.
- Control táctil o móvil.
- Pausa y menú de inicio.
