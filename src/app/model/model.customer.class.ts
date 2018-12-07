export class Customer {
    id: number;
    birthDate: Date;
    civilStatus: string;
    firstName: string;
    lastName: string;
    email: string;

    constructor(id: number, birthDate: Date, civilStatus: string, firstName: string, lastName: string, email: string) {
        this.id = id;
        this.birthDate = birthDate;
        this.civilStatus = civilStatus;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
}
