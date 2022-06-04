import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';



import * as _ from 'lodash';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { Package } from 'src/app/models/package';
import { Location } from 'src/app/models/location';
import { Delivery } from 'src/app/models/delivery';
import { UserService } from '../_services/user.service';

import { PackageService } from '../_services/package.service';
import { DeliveryService } from '../_services/delivery.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { $ } from 'protractor';
import { config } from 'process';

@Component({
  selector: 'app-package-admin',
  templateUrl: './package-admin.component.html',
  styleUrls: ['./package-admin.component.css']
})
export class PackageAdminComponent implements OnInit {

  //  @ViewChild('packageModal', { static: false })
  // packageForm!: NgForm;

  //  @ViewChild('packageModal', { static: false })
  // packageForm!: NgForm;

  @ViewChild("packageModal")
  private contentRef!: TemplateRef<Object>;

  @ViewChild("deliveryModal")
  private contentRef1!: TemplateRef<Object>;

  public packageForm!: FormGroup;
  public deliveryForm!: FormGroup;
  

  
  from_location: Location = new Location();
  to_location: Location = new Location();

  location: Location = new Location();

  public package!: Package;
  public delivery!: Delivery;
  public errMsg: string = "";
  public p: number = 1;
  public action: string = 'add';
  public deliveries: Delivery[]  = [];
  public packages: Package[] = [];
  public Status: any[] = [];

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['package_id', 'description', 'active_delivery_id', 'weight', 'width', 'height','depth', 'from_name','to_name','from_address', 'to_address', 'from_location.lat','from_location.lng', 'to_location.lat','to_location.lng','actions'];
  @ViewChild(MatPaginator, { static: true })
  
  paginator!: MatPaginator;

  isEditMode = false;

  constructor(config: NgbModalConfig,private modalService: NgbModal, private _formBuilder: FormBuilder,private userService: UserService,private packageService: PackageService, private deliveryService: DeliveryService,private _toastr: ToastrService) {
    
    config.backdrop = 'static';
    config.keyboard = false;
  }

   ngOnInit(): void {

    // Initializing Datatable pagination
    this.dataSource.paginator = this.paginator;

    this.Status.push('open');

    this.packageForm = this._formBuilder.group({
      description: [''],
      active_delivery_id: [''],
      weigth: [''],
      width: [''],
      heigth: [''],
      depth: [''],
      from_name: [''],
      from_address: [''],
      from_location_lat: [''],
      from_location_long: [''],
      to_name: [''],
      to_address: [''],
      to_location_lat: [''],
      to_location_long: ['']
    })


    this.deliveryForm = this._formBuilder.group({
      pickup_time: [''],
      start_time: [''],
      end_time: [''],
      status: [''],
      location: [''],
      location_lat: [''],
      location_long: [''],
      package_id: ['']
    })
  

    // Fetch All Packages on Page load
    this.getAllPackagesAndDeliveries()
  }

  open(content: any){
    this.modalService.open(content)
  }

  public onAdd(): void {
    this.action = 'add';
    this.packageForm.reset();
  }

  


  getAllPackagesAndDeliveries() {
    this.packageService.getAllPackage().subscribe({
      next: packages => {
        this.packages = packages;

        this.deliveryService.getAllDelivery().subscribe({
          next: deliveries => {
            this.deliveries = deliveries;
          },
          error: err => this.errMsg = err
        })
      },
      error: err => this.errMsg = err
    });
    

  }

  public onEdit(id: any) {

    

    this.action = 'edit';
    this.package = this.packages.find(_package => _package._id === id)!;


    this.packageForm = this._formBuilder.group({
      
      description: this.package.description,
      active_delivery_id : this.package.active_delivery_id,
      weight: this.package.weight,
      width: this.package.width,
      height: this.package.height,
      depth: this.package.depth,
      to_location_lat: this.package.to_location.lat,
      to_location_long: this.package.to_location.lng,
      from_name: this.package.from_name,
      from_address: this.package.from_address,
      from_location_lat: this.package.from_location.lat,
      from_location_long: this.package.from_location.lng,
      to_name: this.package.to_name,
      to_address: this.package.to_address,
    })

    this.open(this.contentRef);

  }



  CreatePackage(){
    let newPackage = this.packageForm.value;

    //console.log(newPackage);

    this.from_location.lat = newPackage.from_location_lat;
    this.from_location.lng = newPackage.from_location_long;
    this.to_location.lat = newPackage.to_location_lat;
    this.to_location.lng = newPackage.to_location_long;


    newPackage.from_location = this.from_location;
    newPackage.to_location = this.to_location;

    //console.log(newPackage);

    this.packageService.createPackage(newPackage).subscribe();

    this.packageForm.reset();

    this.reloadPage();

    this._toastr.success("New package added successfully.");
    
  }

  public onEditDelivery(id: any) {
    this.action = 'edit';
    this.delivery = this.deliveries.find(_delivery => _delivery._id === id)!;

    
    this.Status = ['open','picked-up', 'in-transit','delivered', 'failed'];

    this.deliveryForm = this._formBuilder.group({

      pickup_time: this.delivery.pickup_time,
      start_time: this.delivery.start_time,
      end_time: this.delivery.end_time,
      status: this.delivery.status,
      location: this.delivery.location,
      location_lat: this.delivery.location.lat,
      location_long: this.delivery.location.lng,
      package_id: this.delivery.package_id,
    })

    this.open(this.contentRef1);

  }

  CreateDelivery(){
    let newDelivery = this.deliveryForm.value;

    //console.log(newDelivery);

    this.location.lat = newDelivery.location_lat;
    this.location.lng = newDelivery.location_long;


    newDelivery.location = this.location;

    //console.log(newDelivery);

    this.deliveryService.createDelivery(newDelivery).subscribe();

    this.deliveryForm.reset();

    this.reloadPage();

    this._toastr.success("New Delivery added successfully.");
    
  }

    EditDelivery(){

      let newDelivery = this.deliveryForm.value;

      //console.log(newDelivery);

      this.location.lat = newDelivery.location_lat;
      this.location.lng = newDelivery.location_long;


      newDelivery.location = this.location;
      
      this.deliveryService.updateDelivery(this.delivery._id, newDelivery).subscribe();
      this.packageForm.reset();

      this.reloadPage();

      this._toastr.success("Delivery updated successfully.");
    
  }

  EditPackage(){
    let newPackage = this.packageForm.value;
    this.from_location.lat = newPackage.from_location_lat;
    this.from_location.lng = newPackage.from_location_long;
    this.to_location.lat = newPackage.to_location_lat;
    this.to_location.lng = newPackage.to_location_long;


    newPackage.from_location = this.from_location;
    newPackage.to_location = this.to_location;
    this.packageService.updateItem(this.package._id, newPackage).subscribe();
    this.packageForm.reset();

    this.reloadPage();

    this._toastr.success("New package added successfully.");
    
  }

  DeletePackage(id: any){
    this.packageService.deleteItem(id).subscribe();
    this.reloadPage();
    this._toastr.success("Client deleted successfully.");
  }

  reloadPage(): void {
    window.location.reload();
  }

  // editItem(element: any) {

  //   /*
  //   get all deliveries ID and store them here
  //   */
  // this.deliveryService.getAllDelivery().subscribe(
  //     data => {
  //       if(data && data.length>0){
  //         this.deliveries = data.map((d: { delivery_id: any; }) => d.delivery_id);
  //       }
  //       else{
  //         this.deliveries = data;
  //       }
  //     },
  //     err => {
  //       //console.log(err.error.message);
  //     }
  //   );

    

  //   this.packageData = _.cloneDeep(element);
    
  //   this.from_location = this.packageData.from_location;
  //   this.to_location = this.packageData.to_location;
  //   this.isEditMode = true;
  // }

  // cancelEdit() {
  //   this.isEditMode = false;
  //   this.packageForm.resetForm();
  // }

  // deleteItem(id: string) {
  //   this.packageService.deleteItem(id).subscribe((response: any) => {

  //     // Approach #1 to update datatable data on local itself without fetching new data from server
  //     this.dataSource.data = this.dataSource.data.filter((o: any) => {
  //       return o._id !== id ? o : false;
  //     })

  //     //console.log(this.dataSource.data);

  //     // Approach #2 to re-call getAllPackages() to fetch updated data
  //     // this.getAllPackages()
  //   });
  // }

  // addPackage() {
  //   this.packageService.createItem(this.packageData).subscribe((response: any) => {
  //     this.dataSource.data.push({ ...response })
  //     this.dataSource.data = this.dataSource.data.map((o: any) => {
  //       return o;
  //     })
  //   });
  // }

  // updatePackage() {
  //   //console.log(this.packageData);

  //   /*
  //   i would get the lats and longs and add it here
  //   */
  //   let from_location = this.from_location;
  //   let to_location = this.to_location;
    
  //   this.packageData.from_location = from_location;
  //   this.packageData.to_location = to_location;

    
  //   //console.log(this.packageData);


  //   this.packageService.updateItem(this.packageData._id, this.packageData).subscribe((response: any) => {

  //     // Approach #1 to update datatable data on local itself without fetching new data from server
  //     this.dataSource.data = this.dataSource.data.map((o: any) => {
  //       if (o._id === response.id) {
  //         o = response;
  //       }
  //       return o;
  //     })

  //     // Approach #2 to re-call getAllPackages() to fetch updated data
  //     this.getAllPackages()

  //     // this.cancelEdit()

  //   });
  // }

  // onSubmit() {
  //   if (this.packageForm.form.valid) {

  //     if (this.isEditMode)
  //       this.updatePackage()
  //     else
  //       this.addPackage();
  //   } else {
  //     //console.log('Enter valid data!');
  //   }
  // }
  

/*
  content?: string;
  result: any[]  = [];
  data:any;
  errorMessage = '';

  constructor(private userService: UserService,private packageService: PackageService, private deliveryService: DeliveryService) { }

  ngOnInit(): void {
    this.packageService.getAllPackage().subscribe(
      data => {
        this.result = data;
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  deletePackage(id: string): void {

    this.packageService.deletePackage(id).subscribe(
      data => {
        this.reloadPage();
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  searchPackage(id: string): void {
    this.packageService.searchPackage(id).subscribe(
      data => {
        this.result = data;
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  reloadPage(): void {
    window.location.reload();
  }
*/
}
// function content(content: any) {
//   throw new Error('Function not implemented.');
// }

