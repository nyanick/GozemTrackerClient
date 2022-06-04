import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'https://gozemtracker.herokuapp.com/api/delivery/';
//const AUTH_API = 'http://localhost:8080/api/delivery/';
const TOKEN_KEY = 'auth-token';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

 constructor(private http: HttpClient) { }

  getDelivery(deliveryId: string): Observable<any> {
    return this.http.get(AUTH_API + deliveryId, httpOptions);
  }

  searchDelivery(deliveryId: string): Observable<any> {
    return this.http.get(AUTH_API + deliveryId, httpOptions);
  }

  deleteDelivery(deliveryId: string): Observable<any> {
    return this.http.delete(AUTH_API + deliveryId, httpOptions);
  }

  getAllDelivery(): Observable<any> {
    return this.http.get(AUTH_API, httpOptions);
  }

  createDelivery(req: Object): Observable<any> {
    return this.http.post(AUTH_API,
      req, httpOptions);
  }

  updateDelivery(deliveryId: string, req: Object): Observable<any> {
    return this.http.put(AUTH_API+ deliveryId,
      req, httpOptions);
  }



}
