import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { PackageService } from '../_services/package.service';
import { DeliveryService } from '../_services/delivery.service';
import { io } from 'socket.io-client';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private socket: any;
  content?: string;

  form: any = {
    packageId: null,
  };
  isSearch = false;
  isSearchFailed = false;
  errorMessage = '';
  //result :any;
  result: any[]  = [];
  data:any;
  active_delivery : any;
  isActiveDelivery = false;
  map:any;
  urlSafe :any;

  constructor(private userService: UserService, private packageService: PackageService, private deliveryService: DeliveryService, public sanitizer: DomSanitizer) { 
  }

  ngOnInit(): void {
    this.map = "";
    this.result = [];
    
    
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  
  onSubmit(): void {
    const { packageId } = this.form;

    this.packageService.searchPackage(packageId).subscribe(
      data => {
        this.result = data;

        if(!this.result || this.result.length < 1){
          this.isSearchFailed = true;
          this.errorMessage = "No item with this Package ID found";
        }
        else{

          
          this.socket = io('https://gozemtracker.herokuapp.com');
          this.socket.on('delivery_updated', (dat: any) => {
            //console.log('Delivery updated received event received!');
            //console.log(dat);
            if(JSON.parse(dat)._id === this.active_delivery._id){
              this.active_delivery = JSON.parse(dat);

              let resp = this.active_delivery;
              this.map = "https://maps.google.com/maps/embed/v1/place?key=AIzaSyCPX2LfYLRu0fW9w6MWebIWUE4yz44zZ8w%20&q="+resp.location.lat+","+ resp.location.lng;
              this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.map);

            }
            
          });
          
          this.data = data[0];
          this.isSearchFailed = false;
          this.isSearch = true;

          /*
          we would check if active delivery ID is set then we get the data and store
          */ 
         

          if(data[0].active_delivery_id){
            this.deliveryService.getDelivery(data[0].active_delivery_id).subscribe(
              resp => {
                if(resp){
                  this.isActiveDelivery = true;
                  this.map = "https://maps.google.com/maps/embed/v1/place?key=AIzaSyCPX2LfYLRu0fW9w6MWebIWUE4yz44zZ8w%20&q="+resp.location.lat+","+ resp.location.lng;
                  this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.map);
                }
                this.isActiveDelivery = true;
                  this.map = "https://maps.google.com/maps/embed/v1/place?key=AIzaSyCPX2LfYLRu0fW9w6MWebIWUE4yz44zZ8w%20&q="+resp.location.lat+","+ resp.location.lng;
                  this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.map);
                this.active_delivery = resp;
              },
              err => {
                this.errorMessage = err.error.message;
                this.isSearchFailed = true;
              }
            );

          }

          }
         

        
        //this.reloadPage();
      },
      err => {
        this.errorMessage = err.error.message;
        this.isSearchFailed = true;
      }
    );
  }

  reloadPage(): void {
    window.location.reload();
  }
}
