import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { TokenStorageService } from './token-storage.service';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Package } from '../models/package';
import { ToastrService } from 'ngx-toastr';

const AUTH_API = 'https://gozemtracker.herokuapp.com/api/package/';
//const AUTH_API = 'http://localhost:8080/api/package/';


var headers_object = new HttpHeaders();
headers_object.append('Content-Type', 'application/json');
//headers_object.append("Authorization", "Bearer " + window.sessionStorage.getItem(TOKEN_KEY));

const httpOptions = {
  headers: headers_object
};

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  constructor(private http: HttpClient, private _toastr: ToastrService) { }

  searchPackage(packageId: string): Observable<any> {
    return this.http.get(AUTH_API + packageId, httpOptions);
  }

  deletePackage(packageId: string): Observable<any> {
    return this.http.delete(AUTH_API + packageId, httpOptions);
  }

  getAllPackage(): Observable<any> {
    return this.http.get(AUTH_API, httpOptions);
  }

  createPackage(req: Object): Observable<any> {
    return this.http.post(AUTH_API,
      req, httpOptions);
  }

  updatePackage(req: Object): Observable<any> {
    return this.http.put(AUTH_API,
      req, httpOptions);
  }



  // Handle API errors
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
      // this._toastr.error('An error occured ' + error.error.message)
      
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };


  // Create a new item
  createItem(item: any): Observable<Package> {
    return this.http
      .post<Package>(AUTH_API, item, httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  // Get single student data by ID
  getItem(id: string): Observable<Package> {
    return this.http
      .get<Package>(AUTH_API + id)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  // Get students data
  getList(): Observable<Package> {
    return this.http
      .get<Package>(AUTH_API)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  // Update item by id
  updateItem(id: string, item: any): Observable<Package> {
    return this.http
      .put<Package>(AUTH_API + id, item, httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  // Delete item by id
  deleteItem(id: string) {
    return this.http
      .delete<Package>(AUTH_API + id, httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

}
