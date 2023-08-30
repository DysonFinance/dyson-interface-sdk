export function between(min: number, max: number): (data: number) => boolean {
  return (data) => {
    return (data <= max) && data >= min
  };
}
