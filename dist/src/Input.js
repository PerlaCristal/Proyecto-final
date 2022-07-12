var Input = /** @class */ (function () {
    function Input(file) {
        this.index = 0;
        this.ok = true;
        this.eoFile = false;
        this.pbis = file;
    }
    Input.prototype.readChar = function () {
        var ch;
        try {
            ch = this.pbis.charAt(this.index++);
            if (this.index > this.pbis.length) {
                this.eoFile = true;
                this.ok = false;
            }
        }
        catch (ioe) {
            this.ok = false;
        }
        return ch;
    };
    Input.prototype.isWhiteSpace = function (ch) {
        return (ch == ' ');
    };
    Input.prototype.isEmpty = function (ch) {
        return (ch.trim() == "");
    };
    Input.prototype.isEnter = function (ch) {
        return (ch == '\n');
    };
    Input.prototype.isDigit = function (ch) {
        return (ch >= '0' && ch <= '9');
    };
    Input.prototype.pushBack = function () {
        this.index--;
    };
    Input.prototype.readInt = function () {
        var neg = false;
        var ch;
        do {
            ch = this.readChar();
        } while (this.isWhiteSpace(ch) || this.isEnter(ch));
        if (ch === '-') {
            neg = true;
            ch = this.readChar();
        }
        if (!this.isDigit(ch)) {
            this.pushBack();
            this.ok = false;
            return 0;
        }
        var x = Number(ch);
        for (;;) {
            ch = this.readChar();
            if (!this.isDigit(ch)) {
                this.pushBack();
                break;
            }
            x = 10 * x + Number(ch);
        }
        return (neg ? -x : x);
    };
    Input.prototype.readFloat = function () {
        var ch;
        var nDec = -1;
        var neg = false;
        do {
            ch = this.readChar();
        } while (this.isWhiteSpace(ch));
        if (ch == '-') {
            neg = true;
            ch = this.readChar();
        }
        if (ch == '.') {
            nDec = 1;
            ch = this.readChar();
        }
        if (!this.isDigit(ch)) {
            this.ok = false;
            this.pushBack();
            return 0;
        }
        var x = Number(ch);
        for (;;) {
            ch = this.readChar();
            if (this.isDigit(ch)) {
                x = 10 * x + Number(ch);
                if (nDec >= 0)
                    nDec++;
            }
            else if (ch == '.' && nDec == -1)
                nDec = 0;
            else
                break;
        }
        while (nDec > 0) {
            x *= 0.1;
            nDec--;
        }
        if (ch == 'e' || ch == 'E') {
            var exp = this.readInt();
            if (!this.fails()) {
                while (exp < 0) {
                    x *= 0.1;
                    exp++;
                }
                while (exp > 0) {
                    x *= 10;
                    exp--;
                }
            }
        }
        else
            this.pushBack();
        return (neg ? -x : x);
    };
    Input.prototype.skipRest = function () {
        var ch;
        do {
            ch = this.readChar();
        } while (!(this.eof() || ch == '\n'));
    };
    Input.prototype.fails = function () {
        return !this.ok;
    };
    Input.prototype.eof = function () {
        return this.eoFile;
    };
    Input.prototype.clear = function () {
        this.ok = true;
    };
    Input.prototype.readString = function () {
        var str = " ";
        var ch;
        do {
            ch = this.readChar();
        } while (!(this.eof() || ch == '"'));
        // Initial quote
        for (;;) {
            ch = this.readChar();
            if (this.eof() || ch == '"') // Final quote (end of string)
                break;
            str += ch;
        }
        return str;
    };
    return Input;
}());
export { Input };
