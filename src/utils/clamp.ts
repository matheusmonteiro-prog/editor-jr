// Opções de interpolate() para NÃO passar das pontas: fora do intervalo, o valor fica parado no
// primeiro ou no último. Uso: interpolate(frame, [0, 10], [0, 1], clamp)
// ou, com easing: interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }).
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
