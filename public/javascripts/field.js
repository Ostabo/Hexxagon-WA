
class FieldResponse {

    constructor(field, turn, xcount, ocount) {
        this._field = field;
        this._turn = turn;
        this._xcount = xcount;
        this._ocount = ocount;
    }

    get field() {
        return this._field;
    }

    set field(value) {
        this._field = value;
    }

    get turn() {
        return this._turn;
    }

    set turn(value) {
        this._turn = value;
    }

    get xcount() {
        return this._xcount;
    }

    set xcount(value) {
        this._xcount = value;
    }

    get ocount() {
        return this._ocount;
    }

    set ocount(value) {
        this._ocount = value;
    }

    static from(json) {
        return Object.assign(new FieldResponse(), json);
    }

}

class Field {

    constructor(rows, cols, cells) {
        this._rows = rows;
        this._cols = cols;
        this._cells = cells;
    }

    get rows() {
        return this._rows;
    }

    set rows(value) {
        this._rows = value;
    }

    get cols() {
        return this._cols;
    }

    set cols(value) {
        this._cols = value;
    }

    get cells() {
        return this._cells;
    }

    set cells(value) {
        this._cells = value;
    }

    static from(json) {
        return Object.assign(new Field(), json);
    }
}

class Cell {

    constructor(row, col, cell) {
        this._row = row;
        this._col = col;
        this._cell = cell;
    }

    get content() {
        return this._cell === 'X' ? '🔷' : this._cell === 'O' ? '🔴' : '';
    }

    get row() {
        return this._row;
    }

    set row(value) {
        this._row = value;
    }

    get col() {
        return this._col;
    }

    set col(value) {
        this._col = value;
    }

    get cell() {
        return this._cell;
    }

    set cell(value) {
        this._cell = value;
    }

    static from(json) {
        return Object.assign(new Cell(), json);
    }
}