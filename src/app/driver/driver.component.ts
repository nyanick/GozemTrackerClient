import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UserService } from '../_services/user.service';

import { PackageService } from '../_services/package.service';
import { DeliveryService } from '../_services/delivery.service';
import { Package } from '../models/package';
import { DomSanitizer } from '@angular/platform-browser';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit {
content?: string;
private socket: any;

  form: any = {
    packageId: null,
  };
  isSearch = false;
  isSearchFailed = false;
  errorMessage = '';
  //result :any;
  result: Package[]  = [];
  data:any;
  map:any;
  urlSafe :any;
  active_delivery : any;
  isActiveDelivery = false;
  location: any;

  pickup = false;
  transit = false;
  end = false;


  constructor(private userService: UserService, private packageService: PackageService, private deliveryService: DeliveryService, public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.result = [];
    this.map = "";
    
  }

  
  onSubmit(): void {
    const { deliveryId } = this.form;
    ////console.log(deliveryId);

    this.deliveryService.getDelivery(deliveryId).subscribe(

      resp => {
          if(resp){
            this.socket = io('https://gozemtracker.herokuapp.com');
            setInterval(() =>{ 
                //this code runs every second 

                const successFunction = (position: { coords: { latitude: any; longitude: any; }; }) => {
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;
                    ////console.log('Your latitude is :'+lat+' and longitude is '+long);

                    var local = {
                      "lat" : lat,
                      "lng" : long,
                    };
                    

                    var res = {
                      "delivery_id": deliveryId,
                      "location": local
                    }

                    var dat = JSON.stringify(res);

                    let data = resp._id  + ',' +lat+','+long;
                    
                    const obj =  resp._id +','+lat+','+long;
                    //console.log(obj);

                    this.socket.emit('location_changed',{data, obj});
                }
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
                } else {
                    alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
                }
                
                function errorFunction(err: any){
                  //console.log(err);
                }
                
            }, 20000);

            
            this.isActiveDelivery = true;
            this.map = "https://maps.google.com/maps/embed/v1/place?key=AIzaSyCPX2LfYLRu0fW9w6MWebIWUE4yz44zZ8w%20&q="+resp.location.lat+","+ resp.location.lng;
            this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.map);
            
            
            
          }
          else{
            this.isSearchFailed = true;
            this.errorMessage = "No item with this Delivery ID found";
          }
          this.active_delivery = resp;
          if(resp.status === "open"){
            this.pickup = true;
            this.end = false;
            this.transit = false;
          }
          else if(resp.status === "in-transit"){
            this.end = true;
            this.pickup = false;
            this.transit = false;
          }
          else if(resp.status === "picked-up"){
            this.transit = true;
            this.end = false;
            this.pickup = false;
          }
          else{
            this.transit = false;
            this.end = false;
            this.pickup = false;
          }

          /*
          i would set the listener here
          */
          this.socket = io('https://gozemtracker.herokuapp.com');
          this.socket.on('delivery_updated', (dat: any) => {
            //console.log('Delivery updated received event received!');
            //console.log(dat);
            if(JSON.parse(dat)._id === this.active_delivery._id){
              this.active_delivery = JSON.parse(dat);

              let resp2 = this.active_delivery;
              if(resp2.status === "open"){
                this.pickup = true;
                this.end = false;
                this.transit = false;
              }
              else if(resp2.status === "in-transit"){
                this.end = true;
                this.pickup = false;
                this.transit = false;
              }
              else if(resp2.status === "picked-up"){
                this.transit = true;
                this.end = false;
                this.pickup = false;
              }
              else{
                this.transit = false;
                this.end = false;
                this.pickup = false;

              }
              this.map = "https://maps.google.com/maps/embed/v1/place?key=AIzaSyCPX2LfYLRu0fW9w6MWebIWUE4yz44zZ8w%20&q="+resp2.location.lat+","+ this.active_delivery.location.lng;
              this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.map);

            }
          });

          this.packageService.searchPackage(resp.package_id).subscribe(
            data => {
              if(data){
                this.result = data;
              }
              this.data = data[0];
              this.isSearchFailed = false;
              this.isSearch = true;
              this.active_delivery = resp;
            },
            err => {
              this.errorMessage = err.error.message;
              this.isSearchFailed = true;
            }
          );



        },
        err => {
          this.errorMessage = err.error.message;
          this.isSearchFailed = true;
        }
      );



    }

  submitButtons(action:any, data:any) {

    //console.log(data);
  
    var status;
    if(action === "pickedup" ){
      status = "pickedup";
    }
    else if(action === "failed" ){
      status =  "failed";
    }
    else if(action === "delivered" ){
      status = "delivered";
    }
    else{
      //In-transit
      status = "in-transit";
    }

    var res = {
      "delivery_id": data,
      "status": status
    }
    
    let obj =  JSON.stringify(res) + '';
    data = data + ','+status;

    //console.log(obj);
    

    this.socket.emit('status_changed', { obj, data});
  }
  
  ngOnDestroy() {
    this.socket.disconnect();
  }


  reloadPage(): void {
    this.ngOnDestroy();
    window.location.reload();
  }
}
function errorFunction(successFunction: (this: any, position: { coords: { latitude: any; longitude: any; }; }) => void, errorFunction: any) {
  throw new Error('Function not implemented.');
}

