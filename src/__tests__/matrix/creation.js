import { Matrix, wrap } from '../..';
import MatrixTransposeView from '../../views/transpose';
import * as util from '../../../testUtils';

describe('Matrix creation', () => {
  it('should create a new object', () => {
    var array = util.getSquareArray();
    var matrix = new Matrix(array);
    expect(matrix).not.toBe(array);
    expect(matrix).toBeInstanceOf(Matrix);
    expect(Matrix.isMatrix(matrix)).toBe(true);
  });

  it('should clone existing matrix', () => {
    var original = util.getSquareMatrix();
    var matrix = new Matrix(original);
    expect(matrix).not.toBe(original);
    expect(matrix).toStrictEqual(original);
  });

  it('should create an empty matrix', () => {
    var matrix = new Matrix(3, 9);
    expect(matrix.rows).toBe(3);
    expect(matrix.columns).toBe(9);
    expect(matrix.get(0, 0)).toBe(0);
  });

  it('should throw with wrong arguments', () => {
    expect(() => new Matrix(6, -1)).toThrow(
      /^nColumns must be a positive integer/
    );
    expect(() => new Matrix(0, 0)).toThrow(
      /^First argument must be a positive number or an array$/
    );
    expect(() => new Matrix([[]])).toThrow(
      /^Data must be a 2D array with at least one element$/
    );
    expect(() => new Matrix([0, 1, 2, 3])).toThrow(/^Data must be a 2D array/);
    expect(() => new Matrix([[0, 1], [0, 1, 2]])).toThrow(
      /^Inconsistent array dimensions$/
    );
    expect(() => new Matrix()).toThrow(
      /^First argument must be a positive number or an array$/
    );
  });

  it('should correctly set rows, columns and values', () => {
    var matrix = util.getSquareMatrix();
    expect(matrix.rows).toBe(3);
    expect(matrix.columns).toBe(3);
    expect(matrix.get(1, 2)).toBe(7);
  });

  it('should correctly check if argument is a matrix', () => {
    var array = util.getSquareArray();
    var matrix = Matrix.checkMatrix(array);
    expect(Matrix.isMatrix(matrix)).toBe(true);
    var check2 = Matrix.checkMatrix(matrix);
    expect(check2).toBe(matrix);
    expect(() => Matrix.checkMatrix()).toThrow(
      /^First argument must be a positive number or an array$/
    );
  });

  it('should create a matrix from 1D array', () => {
    var matrix = Matrix.from1DArray(3, 2, [0, 1, 2, 3, 4, 5]);
    expect(matrix.rows).toBe(3);
    expect(matrix.columns).toBe(2);
    expect(() => Matrix.from1DArray(3, 2, [0, 1, 2, 3])).toThrow(
      /^Data length does not match given dimensions$/
    );
  });

  it('row vector', () => {
    var vector = Matrix.rowVector([0, 1, 2, 3]);
    expect(vector.rows).toBe(1);
    expect(vector.columns).toBe(4);
    expect(vector.to2DArray()).toStrictEqual([[0, 1, 2, 3]]);
  });

  it('column vector', () => {
    var vector = Matrix.columnVector([0, 1, 2, 3]);
    expect(vector.rows).toBe(4);
    expect(vector.columns).toBe(1);
    expect(vector.to2DArray()).toStrictEqual([[0], [1], [2], [3]]);
  });

  it('zeros', () => {
    expect(Matrix.zeros(2, 3).to2DArray()).toStrictEqual([
      [0, 0, 0],
      [0, 0, 0]
    ]);
  });

  it('ones', () => {
    expect(Matrix.ones(2, 3).to2DArray()).toStrictEqual([[1, 1, 1], [1, 1, 1]]);
  });

  it('random', () => {
    var random = Matrix.rand(2, 3);
    var random2 = Matrix.rand(2, 3);
    expect(random.to2DArray()).not.toEqual(random2.to2DArray());
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 3; j++) {
        expect(random.get(i, j)).toBeCloseTo(0, -1);
      }
    }
  });

  it('random with custom RNG', () => {
    var fakeRNG = () => 2;
    expect(Matrix.rand(2, 2, fakeRNG).to2DArray()).toStrictEqual([
      [2, 2],
      [2, 2]
    ]);
  });

  it('eye/identity', () => {
    var eye1 = Matrix.eye(3);
    expect(eye1).toStrictEqual(Matrix.identity(3));
    expect(eye1.to2DArray()).toStrictEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);

    var eye2 = Matrix.eye(3, 2);
    expect(eye2.to2DArray()).toStrictEqual([[1, 0], [0, 1], [0, 0]]);
  });

  it('eye with other value than 1', () => {
    var eye1 = Matrix.eye(3, 3, 3);
    expect(eye1.to2DArray()).toStrictEqual([[3, 0, 0], [0, 3, 0], [0, 0, 3]]);
  });

  it('diag/diagonal', () => {
    var arr = [1, 2, 3];
    var diag = Matrix.diag(arr);
    expect(diag).toStrictEqual(Matrix.diagonal(arr));
    expect(diag.to2DArray()).toStrictEqual([[1, 0, 0], [0, 2, 0], [0, 0, 3]]);

    expect(Matrix.diag(arr, 2).to2DArray()).toStrictEqual([[1, 0], [0, 2]]);
    expect(Matrix.diag(arr, 2, 4).to2DArray()).toStrictEqual([
      [1, 0, 0, 0],
      [0, 2, 0, 0]
    ]);
    expect(Matrix.diag(arr, 4, 4).to2DArray()).toStrictEqual([
      [1, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 0]
    ]);
  });

  it('Symbol.species should work for views', () => {
    var matrix = new Matrix([[1, 1, 1], [1, 1, 1]]);
    var view = new MatrixTransposeView(matrix);
    expect(matrix.transpose().mmul(matrix)).toStrictEqual(view.mmul(matrix));
  });

  it('Symbol.species should work on static evaluated methods', () => {
    var a = [[1, 2]];
    var b = [[3, 1]];
    expect(Matrix.subtract(a, b).to2DArray()).toStrictEqual([[-2, 1]]);
    expect(MatrixTransposeView.subtract(a, b).to2DArray()).toStrictEqual([[-2, 1]]);
  });

  it('JSON.stringify should always return a 2D array', () => {
    const data = [[0, 1], [2, 3]];
    const json = JSON.stringify(data);
    const matrix = new Matrix(data);
    expect(JSON.stringify(matrix)).toBe(json);
    const mat1D = wrap(matrix.to1DArray(), { rows: 2 });
    expect(JSON.stringify(mat1D)).toBe(json);
    const transposeTwice = new MatrixTransposeView(
      new MatrixTransposeView(matrix)
    );
    expect(JSON.stringify(transposeTwice)).toBe(json);
  });
});
