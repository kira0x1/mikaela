export class CommandError {

    constructor(message: string, trace?: string) {
        this.message = message;
        this.trace = trace;
    }

    message: string;
    trace?: string;
}
