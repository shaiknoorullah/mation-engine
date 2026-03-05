import { OperandMap } from "../interfaces/operandMap";

const createOperands = <T extends readonly string[]>(
  values: T
): OperandMap<T[number]> => {
  return values.reduce((acc, key) => {
    acc[key as keyof OperandMap<T[number]>] = key;
    return acc;
  }, {} as OperandMap<T[number]>);
};

export { createOperands };
