# SPEC 02 — Animación de explosión al romper bloques

> **Estado:** Borrador
> **Depende de:** SPEC 01
> **Fecha:** 2026-10-29
> **Objetivo:** Reproducir sobre cada bloque roto la animación de 4 frames de `EXPLOSION_FRAMES` durante `EXPLOSION_DURATION` ms, en lugar de hacerlo desaparecer de golpe.

## Alcance

**Dentro:**

- Al romperse un bloque, se crea una explosión en su posición y tamaño que se dibuja con los frames de `EXPLOSION_FRAMES[color]` usando `drawFrame`.
- Los 4 frames se reparten en el total de `EXPLOSION_DURATION` (150 ms, ~37,5 ms por frame). Al terminar, la explosión desaparece.
- La explosión es solo visual: el bloque pasa a `alive = false` y suma los 10 puntos en el instante del golpe, igual que en el SPEC 01. La bola no colisiona con la explosión.
- Los bloques grises usan tal cual los frames que define el asset (`EXPLOSION_FRAMES.gray`, que reutiliza los frames rojos).
- La pantalla de victoria aparece cuando no quedan bloques vivos **y** no quedan explosiones activas.
- Las explosiones siguen animándose si se pierde una vida o se llega a `gameover`.
- Reiniciar la partida (`resetGame`) descarta las explosiones activas.
- Actualizar la sección de estado de `CLAUDE.md` (las explosiones dejan de estar "sin usar").

**Fuera de alcance (para specs futuros):**

- Sonidos: `assets/sounds/break-sound.mp3` y `ball-bounce.mp3` siguen sin usarse.
- Frames de explosión grises propios (implicaría editar el PNG y `spritesheet.js`).
- Partículas, sacudida de pantalla u otros efectos.
- Cambios en colisiones, puntaje, vidas o en cualquier otra mecánica.
- Animaciones de la pala, la bola o las pantallas finales.

## Modelo de datos

Una estructura nueva en `game.js`, en memoria, sin persistencia. `spritesheet.js` no cambia.

```js
const EXPLOSION_FRAME_COUNT = 4; // longitud de cada EXPLOSION_FRAMES[color]

const state = {
  // ...campos del SPEC 01
  explosions: [/* { x, y, w, h, color, elapsed } */], // elapsed en ms desde la rotura
};
```

Convenciones:

- `x, y, w, h` se copian del bloque roto, así que la explosión se dibuja a su mismo tamaño (68 × 24); los frames de 32 × 16 se escalan con `drawFrame`.
- `elapsed` avanza con `dt * 1000` en cada `update`.
- Frame mostrado: `Math.min(EXPLOSION_FRAME_COUNT - 1, Math.floor(elapsed / (EXPLOSION_DURATION / EXPLOSION_FRAME_COUNT)))`.
- La explosión se elimina cuando `elapsed >= EXPLOSION_DURATION`.
- `update` avanza las explosiones en **todas** las fases, no solo en `playing`.

## Plan de implementación

1. Añadir `explosions: []` a `state` y la constante `EXPLOSION_FRAME_COUNT`. Vaciar `explosions` en `resetGame`. Prueba manual: el juego funciona igual que antes, sin errores en consola.
2. En `collideBallWithBlocks`, al hacer `blk.alive = false`, añadir una explosión con la posición, tamaño y color del bloque. Prueba: en la consola, `state.explosions.length` sube al romper un bloque.
3. Añadir `updateExplosions(dt)`, llamada desde `update` en todas las fases, que avanza `elapsed` y elimina las terminadas. Prueba: `state.explosions` vuelve a `[]` unos 150 ms después de cada rotura.
4. Dibujar las explosiones en `draw` con `drawFrame(ctx, EXPLOSION_FRAMES[color][frame], x, y, w, h)`, después de los bloques y antes de la pala. Prueba: al romper un bloque se ve la animación de 4 frames en su lugar.
5. Cambiar la condición de victoria: `won` solo cuando no quedan bloques vivos y `state.explosions` está vacío. Mientras tanto, no comprobar `loseLife`. Prueba: al romper el último bloque se ve explotar y después aparece la pantalla de victoria.
6. Actualizar la sección de estado de `CLAUDE.md`: las explosiones ya se usan; solo los sonidos siguen sin usar. Prueba: el texto coincide con el comportamiento real.

## Criterios de aceptación

- [ ] Al abrir el juego servido desde la raíz del repo, la consola no muestra errores.
- [ ] Al romper un bloque, en su posición se ve una animación de 4 frames en lugar de desaparecer de golpe.
- [ ] La animación dura 150 ms en total y después no queda ningún sprite en esa posición.
- [ ] Cada color de bloque muestra los frames de su propia fila en `EXPLOSION_FRAMES`; el gris muestra los frames rojos.
- [ ] La explosión se dibuja con el mismo tamaño (68 × 24) y posición que tenía el bloque.
- [ ] El puntaje sube exactamente 10 en el instante del golpe, sin esperar al fin de la animación.
- [ ] La bola atraviesa la zona de una explosión activa sin rebotar.
- [ ] Romper varios bloques en rápida sucesión muestra varias explosiones a la vez, cada una con su propio progreso.
- [ ] Al romper el último bloque, la animación se completa y recién después aparece la pantalla de victoria con 700 puntos.
- [ ] Si se pierde una vida o se llega a `gameover` mientras hay explosiones activas, estas terminan su animación.
- [ ] Al reiniciar desde la victoria o el game over, `state.explosions` queda vacío y no se ven restos de explosiones.
- [ ] No se reproduce ningún sonido en todo el juego.
- [ ] `CLAUDE.md` ya no lista `EXPLOSION_FRAMES` / `EXPLOSION_DURATION` como "no usados".

## Decisiones tomadas y descartadas

- **Sí:** la explosión es una lista aparte (`state.explosions`) y el bloque pasa a `alive = false` al instante. No toca la lógica de colisión ni de puntaje del SPEC 01.
- **No:** mantener el bloque "vivo" durante la animación. Complica colisiones y puntaje, y arriesga dobles golpes.
- **Sí:** `EXPLOSION_DURATION` (150 ms) es la duración **total** de los 4 frames. Respeta el valor del asset y no frena el ritmo del juego.
- **No:** 150 ms por frame (600 ms totales). Resultaría más largo que el intervalo típico entre golpes.
- **Sí:** el bloque gris usa los frames rojos tal cual los define el asset. Cero código especial.
- **No:** omitir la animación del gris, ni crear frames grises nuevos. Lo primero es inconsistente; lo segundo amplía el alcance a editar el PNG.
- **Sí:** esperar el fin de las explosiones para pasar a `won`. Se ve explotar el último bloque.
- **No:** victoria inmediata. Cortaría la última explosión.
- **Sí:** las explosiones avanzan en todas las fases y se limpian solo en `resetGame`. Evita que queden congeladas o desaparezcan a medias.
- **Sí:** sin sonidos. El usuario pidió solo la animación; `break-sound.mp3` queda para otro spec.

## Riesgos identificados

| Riesgo                                                                                  | Mitigación                                                                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Con `dt` limitado a 0,05 s, un fotograma lento puede saltarse frames de la animación    | Aceptado: con 150 ms totales el salto es casi imperceptible; el índice de frame se limita a `FRAME_COUNT - 1`. |
| Durante los ~150 ms de espera tras el último bloque la bola sigue moviéndose y puede caer | Omitir la comprobación de `loseLife` cuando no quedan bloques vivos.                                         |
| Los frames de explosión (32 × 16) escalados a 68 × 24 pueden verse borrosos             | Revisar visualmente; el atlas ya se escala así con los bloques normales.                                     |

## Lo que **no** está en este spec

- Sonidos y música.
- Frames de explosión grises propios.
- Partículas u otros efectos visuales.
- Cambios de mecánica (colisiones, puntaje, vidas).
- Animaciones de pala, bola o pantallas finales.
