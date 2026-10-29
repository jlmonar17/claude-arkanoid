# SPEC 03 — Niveles, sonidos, pausa y salto de nivel

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-10-29
> **Objetivo:** Añadir 5 niveles con layouts distintos y bola un 10 % más rápida en cada uno, y reproducir `ball-bounce.mp3` cuando la bola rebota en la pala, las paredes o el techo y `break-sound.mp3` cuando se rompe un bloque, con pausa (`P` / `Escape`) y salto directo a un nivel con las teclas 1 a 5 para facilitar las pruebas.

## Por qué existe este spec

Los SPEC 01 y 02 dejaron explícitamente fuera los niveles y los sonidos. Este spec los activa a la vez porque ambos tocan `game.js` y los `assets/sounds/*` ya existen. Añade también pausa y salto de nivel, pensados para poder probar cualquier nivel sin tener que jugar los anteriores.

Sustituye dos criterios del SPEC 01: "no se reproduce ningún sonido" y "al romper los 70 bloques aparece la victoria con 700 puntos". Ahora la victoria llega al terminar el nivel 5.

## Alcance

**Dentro:**

- 5 niveles, cada uno definido como un layout de texto en `game.js`. La cuadrícula sigue siendo de 7 filas × 10 columnas con el tamaño y los márgenes de `GRID`.
- El nivel 1 es el layout actual del SPEC 01 (70 bloques). Los niveles 2 a 5 tienen forma distinta y colocan los huecos de modo que los rebotes sean menos predecibles.
- La bola es un 10 % más rápida en cada nivel: velocidad = 360 × (1 + 0,1 × (nivel − 1)) px/s, es decir 360, 396, 432, 468 y 504.
- Al romper el último bloque de un nivel que no es el 5 (y terminar sus explosiones), aparece una pantalla "Nivel completado" en el canvas. Clic o barra espaciadora cargan el siguiente nivel con la bola pegada a la pala.
- Puntaje y vidas se conservan entre niveles. Perder una vida no cambia de nivel ni restaura bloques.
- Al terminar el nivel 5 aparece la pantalla de victoria actual con el puntaje final. El game over y la victoria reinician desde el nivel 1.
- El HUD muestra el nivel actual (`Nivel: N`).
- Sonido de rebote (`assets/sounds/ball-bounce.mp3`) cuando la bola rebota en la pala, en una pared lateral o en el techo.
- Sonido de rotura (`assets/sounds/break-sound.mp3`) cuando se rompe un bloque. Ese golpe suena solo como rotura, sin añadir el rebote.
- Si un sonido está sonando y vuelve a dispararse, se reinicia desde el principio.
- Pausa: las teclas `P` y `Escape` alternan pausa y reanudación, solo durante la fase `playing`. Pausado, se congelan la bola, la pala, las explosiones y los sonidos nuevos, y el canvas se oscurece con el texto "Pausa" y la indicación de reanudar. Al reanudar, la bola sigue donde estaba.
- Salto de nivel: las teclas `1` a `5` cargan el nivel correspondiente en cualquier fase. El puntaje y las vidas se conservan; solo cambian el nivel, los bloques y la velocidad de la bola. La partida pasa a `ready` con la bola pegada a la pala, se descartan las explosiones y se sale de la pausa si estaba activa.
- Si se salta de nivel desde `won` o `gameover`, se empieza una partida nueva en ese nivel (puntaje 0 y 3 vidas), porque con 0 vidas no se podría jugar.
- El HUD sigue mostrando `Nivel: N`; el salto se confirma ahí. No hay menú ni botones en pantalla.
- Actualizar `README.md` y la sección de estado de `CLAUDE.md`.

**Fuera de alcance (para specs futuros):**

- Bloques de varios golpes o indestructibles.
- Power-ups.
- Tecla de silencio, control de volumen o indicador de sonido en el HUD.
- Música de fondo y sonidos de victoria, game over, pérdida de vida o cambio de nivel.
- Récords, persistencia y selección de nivel.
- Aumento de velocidad dentro de un mismo nivel.
- Menú de selección de nivel o botones clicables en el canvas.
- Pausa automática al perder el foco de la ventana.
- Pausa en las fases `ready`, `levelcomplete`, `won` y `gameover`.
- Cambios en el tamaño del canvas, la pala o el sistema de puntaje.

## Modelo de datos

Estructuras nuevas en `game.js`, en memoria, sin persistencia. `spritesheet.js` no cambia.

```js
const LEVELS = [
  // 7 cadenas de 10 caracteres por nivel; '.' = hueco, la letra es el color del bloque
  // R=red C=cyan G=green M=magenta Y=yellow H=hotpink K=gray
  ['RRRRRRRRRR', 'CCCCCCCCCC', 'GGGGGGGGGG', 'MMMMMMMMMM', 'YYYYYYYYYY', 'HHHHHHHHHH', 'KKKKKKKKKK'], // 70
  ['....RR....', '...CCCC...', '..GGGGGG..', '.MMMMMMMM.', 'YYYYYYYYYY', '.HHHHHHHH.', '..KKKKKK..'], // 44
  ['R.R.R.R.R.', '.C.C.C.C.C', 'G.G.G.G.G.', '.M.M.M.M.M', 'Y.Y.Y.Y.Y.', '.H.H.H.H.H', 'K.K.K.K.K.'], // 35
  ['RRRRRRRRRR', 'C..CCCC..C', 'G..GGGG..G', 'M..MMMM..M', 'Y..YYYY..Y', 'H..HHHH..H', 'K........K'], // 42
  ['RRRRRRRRRR', 'CC.CCCC.CC', 'GGGGGGGGGG', 'MM.MMMM.MM', 'YYYYYYYYYY', 'HH.HHHH.HH', 'KKKKKKKKKK'], // 64
];

const LEVEL_COLOR_KEYS = { R: 'red', C: 'cyan', G: 'green', M: 'magenta', Y: 'yellow', H: 'hotpink', K: 'gray' };
const BALL_BASE_SPEED = 360;
const BALL_SPEED_STEP = 0.1; // +10 % de BALL_BASE_SPEED por nivel

const SOUNDS = {
  bounce: new Audio('assets/sounds/ball-bounce.mp3'),
  break: new Audio('assets/sounds/break-sound.mp3'),
};

const state = {
  // ...campos de los SPEC 01 y 02
  phase: 'ready', // 'ready' | 'playing' | 'levelcomplete' | 'won' | 'gameover'
  level: 1,       // 1..LEVELS.length
  paused: false,  // solo puede ser true mientras phase === 'playing'
};
```

Convenciones:

- `createBlocks(level)` recorre `LEVELS[level - 1]` con las mismas fórmulas de posición de `GRID` y omite los `'.'`.
- `state.ball.speed` se recalcula al cargar cada nivel; `launchBall` y el rebote en la pala ya lo usan, por lo que no cambian.
- `playSound(sound)` hace `sound.currentTime = 0` y `sound.play().catch(() => {})`, de modo que un fallo de reproducción no rompe el juego.
- El sonido de rebote en paredes y techo se dispara solo cuando se aplica el rebote, no en cada fotograma.
- `update` retorna de inmediato si `state.paused`, de modo que no avanzan bola, pala, explosiones ni sonidos. `draw` sigue ejecutándose y dibuja el velo de pausa encima.
- `togglePause()` solo actúa si `phase === 'playing'` o si `paused` ya es true. No cambia `phase`.
- `jumpToLevel(n)` valida `1 <= n <= LEVELS.length`, fija `level`, `paused = false` y reutiliza la carga de nivel del paso de "Nivel completado"; si la fase era `won` o `gameover`, además pone `score = 0` y `lives = INITIAL_LIVES`.
- Las teclas `1` a `5` se mapean con `e.key` a `jumpToLevel(Number(e.key))`; se ignora `e.repeat` y cualquier otra tecla numérica.
- Con la pausa activa, el movimiento del ratón sigue guardando `mouseX`, pero la pala no se mueve; al reanudar, vuelve a seguirlo.
- Total de bloques de los 5 niveles: 255, es decir 2550 puntos si se completa la partida sin perder vidas.

## Plan de implementación

1. Añadir `LEVELS`, `LEVEL_COLOR_KEYS`, `state.level` y adaptar `createBlocks` para que lea el layout del nivel actual. `resetGame` fija `level = 1`. Prueba manual: el juego se ve y se comporta exactamente como antes (nivel 1 con 70 bloques).
2. Añadir la velocidad por nivel (`BALL_BASE_SPEED`, `BALL_SPEED_STEP`) y el campo `Nivel: N` en el HUD. Prueba: en la consola, `state.ball.speed` vale 360 y el HUD muestra `Nivel: 1`.
3. Añadir la fase `levelcomplete`: al romper el último bloque y vaciar las explosiones, si `level < LEVELS.length` pasa a `levelcomplete` y se dibuja "Nivel completado"; si es el último, pasa a `won`. Prueba: en la consola, dejar un solo bloque y romperlo muestra la pantalla de nivel completado.
4. Gestionar `handleAction` en `levelcomplete`: incrementa `level`, recrea los bloques, recalcula la velocidad, vacía las explosiones, pega la bola a la pala y pasa a `ready`, conservando puntaje y vidas. Prueba: se recorren los 5 niveles con layout y velocidad distintos (`state.level = 4` en consola para saltar).
5. Cargar los sonidos con `SOUNDS` y `playSound`, y reproducir `bounce` en el rebote con la pala. Prueba: suena al golpear la pala y no suena en ninguna otra parte.
6. Reproducir `bounce` en los rebotes contra paredes laterales y techo (`updateBall`) y `break` al romper un bloque (`collideBallWithBlocks`). Prueba: cada evento suena una vez; el golpe a un bloque no suena como rebote.
7. Añadir la pausa: `state.paused`, `togglePause()` con `P` y `Escape`, retorno temprano en `update` y velo con "Pausa" en `draw`. Prueba: durante `playing`, `P` congela todo y vuelve a reanudar; en `ready` no hace nada.
8. Añadir `jumpToLevel(n)` con las teclas `1` a `5`, reutilizando la carga de nivel del paso 4. Prueba: en cualquier fase, pulsar `4` muestra el layout del nivel 4, velocidad 468 y la bola pegada a la pala, con puntaje y vidas intactos.
9. Actualizar `README.md` (niveles, sonidos, controles de pausa y salto, estructura de `assets/`) y la sección de estado de `CLAUDE.md` (niveles, fase `levelcomplete`, `state.paused`, `jumpToLevel`, sonidos ya usados). Prueba: el texto coincide con el comportamiento real.

## Criterios de aceptación

- [ ] Al abrir el juego servido desde la raíz del repo, la consola no muestra errores.
- [ ] El HUD muestra `Nivel: 1` al empezar y el número del nivel actual en cada nivel.
- [ ] El nivel 1 tiene 70 bloques; los niveles 2, 3, 4 y 5 tienen 44, 35, 42 y 64 bloques respectivamente.
- [ ] Los 5 layouts se ven distintos entre sí y coinciden con `LEVELS`.
- [ ] `state.ball.speed` vale 360, 396, 432, 468 y 504 en los niveles 1 a 5.
- [ ] Al romper el último bloque de los niveles 1 a 4, tras terminar las explosiones, aparece "Nivel completado".
- [ ] En "Nivel completado", clic o barra espaciadora cargan el siguiente nivel con la bola pegada a la pala y sin explosiones residuales.
- [ ] El puntaje y las vidas son los mismos antes y después de cambiar de nivel.
- [ ] Perder una vida no cambia el nivel ni restaura bloques ya rotos.
- [ ] Al completar el nivel 5 aparece la victoria con 2550 puntos.
- [ ] Desde game over o victoria, clic o espacio reinician en el nivel 1 con 70 bloques, 0 puntos, 3 vidas y velocidad 360.
- [ ] Durante `playing`, `P` pausa: la bola, la pala y las explosiones se detienen y aparece "Pausa" sobre el canvas.
- [ ] Durante la pausa, `P` o `Escape` reanudan y la bola continúa desde la misma posición con la misma velocidad.
- [ ] Mover el ratón durante la pausa no mueve la pala; al reanudar vuelve a seguir al ratón.
- [ ] Durante la pausa no se dispara ningún sonido nuevo.
- [ ] `P` y `Escape` no hacen nada en `ready`, `levelcomplete`, `won` ni `gameover`.
- [ ] Clic o espacio no reinician ni lanzan la bola mientras el juego está en pausa.
- [ ] Pulsar `1` a `5` salta al nivel indicado desde `ready`, `playing`, pausa, `levelcomplete`, `won` y `gameover`, con el layout y la velocidad de ese nivel.
- [ ] Tras un salto desde `ready`, `playing`, pausa o `levelcomplete`, el puntaje y las vidas no cambian y la bola queda pegada a la pala en `ready`, sin pausa ni explosiones residuales.
- [ ] Tras un salto desde `won` o `gameover`, el puntaje es 0 y las vidas son 3.
- [ ] Pulsar otras teclas numéricas (`0`, `6` a `9`) no hace nada.
- [ ] Al rebotar la bola en la pala suena `ball-bounce.mp3`.
- [ ] Al rebotar la bola en una pared lateral o en el techo suena `ball-bounce.mp3`.
- [ ] Al romper un bloque suena `break-sound.mp3` y no suena `ball-bounce.mp3` por ese mismo golpe.
- [ ] Dos eventos de sonido seguidos reinician el sonido en lugar de ignorarse.
- [ ] Con la bola pegada a la pala (`ready`) y en las pantallas `levelcomplete`, `won` y `gameover`, no se dispara ningún sonido nuevo.
- [ ] Si un mp3 no carga, el juego sigue funcionando sin errores no capturados.
- [ ] `README.md` y `CLAUDE.md` describen los niveles y los sonidos y ya no dicen que los sonidos están sin usar.

## Decisiones tomadas y descartadas

- **Sí:** 5 niveles con layouts propios. Dan progresión visible sin convertir el spec en una tarea de diseño de niveles.
- **No:** 3 o 10 niveles. Tres se sienten cortos; diez piden mucho diseño y prueba manual.
- **Sí:** layouts como arreglos de cadenas en `game.js`. Se leen a simple vista y no requieren archivos ni `fetch`.
- **No:** un `levels.json` aparte. Obligaría a servir y cargar otro archivo para 5 layouts pequeños.
- **Sí:** el nivel 1 conserva el layout actual. No cambia la experiencia ya probada.
- **Sí:** la dificultad sube con el layout y con +10 % de velocidad por nivel, de forma lineal sobre la velocidad base (360 → 504). Se eligió lineal y no compuesto para que el nivel 5 llegue a 504 px/s y no a ~527, y se entienda a simple vista.
- **No:** más bloques resistentes. Implica bloques de varios golpes, fuera de alcance.
- **Sí:** pantalla "Nivel completado" con clic o espacio para continuar. Da un respiro y reutiliza el mismo input de las demás pantallas.
- **No:** avance automático o inmediato. El jugador podría perder el ritmo.
- **Sí:** puntaje y vidas se conservan entre niveles; el game over reinicia desde el nivel 1. Es la regla clásica del género.
- **Sí:** el golpe a un bloque solo suena como `break`. Evita dos sonidos casi simultáneos que ensucian el audio.
- **No:** reproducir también `bounce` al romper bloque. Se descartó por el motivo anterior.
- **Sí:** reiniciar el sonido con `currentTime = 0` si se vuelve a disparar. Garantiza que cada evento se oiga aunque sean seguidos.
- **No:** clonar un `Audio` por evento ni usar Web Audio API. Es más complejo de lo que necesita este juego.
- **No:** tecla de silencio. El usuario no la pidió; queda para un spec futuro.
- **Sí:** pausa con `P` o `Escape`, solo en `playing`. No choca con clic/espacio y pausar con la bola pegada a la pala no aporta nada.
- **No:** botón de pausa en pantalla ni pausa en otras fases. Añade UI y casos sin beneficio.
- **Sí:** `state.paused` como booleano aparte y no como fase nueva. Mantiene `phase` intacta y reanudar no necesita recordar la fase anterior.
- **Sí:** selector de nivel con las teclas `1` a `5`, sin UI. Era la opción más simple para pruebas y el HUD ya muestra el nivel.
- **No:** menú o botones clicables en el canvas. Más dibujo y colisión de clics, además de riesgo de lanzar la bola por error.
- **Sí:** el salto conserva puntaje y vidas. Permite probar un nivel sin perder la partida en curso.
- **Sí:** el salto desde `won` o `gameover` empieza una partida nueva en ese nivel. Con 0 vidas el juego no sería jugable.

## Riesgos identificados

| Riesgo                                                                                   | Mitigación                                                                                                                  |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| El navegador bloquea el audio hasta que hay un gesto del usuario                         | El primer sonido llega después del clic/espacio que lanza la bola; además `play()` captura el rechazo con `.catch`.         |
| A 504 px/s, con `dt` máximo de 0,05 s, la bola avanza ~25 px por fotograma y puede atravesar la pala o un bloque | Revisar visualmente en el nivel 5; si ocurre, mover la bola en subpasos (ya previsto como mitigación en el SPEC 01).         |
| Un layout con huecos puede dejar bloques inalcanzables y el nivel no se podría terminar   | Los layouts propuestos no encierran bloques; comprobar a mano que todos son alcanzables.                                    |
| El salto de nivel permite saltarse la progresión | Aceptado: es una herramienta de pruebas pedida por el usuario; no hay récords que proteger. |
| Pausar deja la bola congelada y el siguiente `dt` es enorme al reanudar | `update` retorna sin mover nada y `dt` ya está limitado a 0,05 s en el bucle. |
| Reiniciar `currentTime` en un `Audio` aún cargando puede lanzar excepción                | Envolver en `try/catch` junto con el `.catch` de `play()`.                                                                  |
| Sonidos muy seguidos (pala + rotura en el mismo fotograma) se recortan entre sí          | Aceptado: son sonidos distintos y cada uno solo reinicia su propio `Audio`.                                                 |

## Lo que **no** está en este spec

- Bloques de varios golpes, indestructibles o power-ups.
- Tecla de silencio, volumen o música de fondo.
- Sonidos de victoria, game over, pérdida de vida o cambio de nivel.
- Récords, persistencia o selección de nivel.
- Aumento de velocidad dentro de un mismo nivel.
- Menú de niveles o botones clicables, y pausa automática al perder el foco.
- Más de 5 niveles.
