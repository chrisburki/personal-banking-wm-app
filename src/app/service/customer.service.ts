import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { environment } from './../../environments/environment';
import { Customer } from '../model/model.customer.class';
import { CUST } from '../mock/mock.customer.data';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})

export class CustomerService {


  private customerUrl = '/customer';

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
    // TODO: send the error to remote logging infrastructure
    console.error('Error' + error); // log to console instead
    console.log('Log Error' + error);

    // Let the app keep running by returning an empty result.
    return of(result as T);
    };
  }

  // in case service is not available mock data are returned
  getCustomer(): Observable<Customer> {
//    const url = `${this.customerUrl}/${12}`;
    const url = `${this.customerUrl}?key=AB`;
    return this.http.get<Customer>(API_URL + url, httpOptions)
      .pipe(
        tap(data => console.log(data)),
        catchError(this.handleError('getCustomer', CUST))
      );
  }

  constructor(private http: HttpClient) { }
}
