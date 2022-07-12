export class Input
{
  private pbis: string;
  private index: number = 0;
  private ok:boolean = true;
  private eoFile:boolean  = false;

  constructor(file:string){
    this.pbis = file;
  }

  readChar(): string{
    let ch: string;
    try {
      ch = this.pbis.charAt(this.index++);
      if(this.index>this.pbis.length) {
        this.eoFile = true;
        this.ok = false;
      }
    }
    catch (ioe) {
      this.ok = false;
    }
    return ch;
  }

  isWhiteSpace(ch:string):boolean {
    return (ch==' ');
  }
  isEmpty(ch:string):boolean {
    return (ch.trim()=="");
  }
  isEnter(ch:string):boolean {
    return (ch=='\n');
  }

  isDigit(ch: string): boolean{
    return (ch >= '0' && ch <= '9');
  }
  pushBack(): void{
    this.index--;
  }
  readInt(): number{
    let neg:boolean = false;
    let ch:string;
    do {
      ch = this.readChar();
    } while (this.isWhiteSpace(ch)||this.isEnter(ch));
    if (ch === '-') {
      neg = true;
      ch = this.readChar();
    }
    if (!this.isDigit(ch)) {
      this.pushBack();
        this.ok = false;
        return 0;
    }
    let x:number = Number(ch);
    for (; ;){
      ch = this.readChar();
      if (!this.isDigit(ch)) {
        this.pushBack();
        break;
      }
      x = 10 * x + Number(ch);
    }
    return (neg ? -x : x);
  }
  readFloat(): number{
    let ch:string;
    let nDec:number = -1;
    let neg:boolean = false;
    do{
      ch = this.readChar();
    }while (this.isWhiteSpace(ch));
    if (ch == '-'){neg = true; ch = this.readChar();}
    if (ch == '.'){nDec = 1; ch = this.readChar();}
    if (!this.isDigit(ch)) {
      this.ok = false;
      this.pushBack();
      return 0;
    }
    let x:number = Number(ch);
    for (; ;){
      ch = this.readChar();
      if (this.isDigit(ch)) {
        x = 10 * x + Number(ch);
        if (nDec >= 0)
          nDec++;
      }
      else if (ch == '.' && nDec == -1)
        nDec = 0;
      else break;
    }
    while (nDec > 0) {
      x *= 0.1;
      nDec--;
    }
    if (ch == 'e' || ch == 'E') {
      let exp:number = this.readInt();
      if (!this.fails()) {
        while (exp < 0) {
          x *= 0.1; exp++;
        }
        while (exp > 0) {
          x *= 10; exp--;
        }
      }
    }
    else this.pushBack();
    return (neg ? -x : x);
  }
  skipRest(): void {// Skip rest of line
    let ch: string;
    do {
      ch = this.readChar();
    }
    while (!(this.eof() || ch == '\n'));
  }
  fails(): boolean{
    return !this.ok;
  }
  eof(): boolean {
    return this.eoFile;
  }
  clear(): void {
    this.ok = true;
  }
  readString():string{    // Read first string between quotes (").
    let str:string = " ";
    let ch:string;
    do {
      ch = this.readChar();
    }while (!(this.eof() || ch == '"'));
                                                   // Initial quote
    for (; ;){
      ch = this.readChar();
      if (this.eof()  ||   ch == '"') // Final quote (end of string)
        break;
      str += ch;
    }
    return str;
  }
}