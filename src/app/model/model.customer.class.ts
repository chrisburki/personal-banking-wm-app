export class Customer {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: Date;
    civilStatus: string;
    email: string;

    constructor(id: number, firstName: string, lastName: string, birthDate: Date, civilStatus: string, email: string) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.civilStatus = civilStatus;
        this.email = email;
    }
}
