import { IServicio } from 'src/app/model/servicio-interfaces';
import { FacturaService } from './../../../../../service/factura.service';
import { IFactura } from './../../../../../model/factura-interfaces';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ICompra, ICompraToSend } from 'src/app/model/compra-interfaces';
import { CompraService } from 'src/app/service/compra.service';
import { DateTimeService } from 'src/app/service/datetime.service';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { IconService } from 'src/app/service/icon.service';
import { ServicioService } from 'src/app/service/servicio.service';

declare let $: any;

@Component({
  selector: 'app-edit-compra',
  templateUrl: './edit-compra.component.html',
  styleUrls: ['./edit-compra.component.css']
})
export class EditCompraComponent implements OnInit {
  strEntity: string = "compra"
  strOperation: string = "edit"
  strTitleSingular: string = "Compra";
  strTitlePlural: string = "Compras";

  oCompra: ICompra = null;
  oCompraToSend: ICompraToSend = null;
  id: number = null;
  oForm: FormGroup = null;
  strResult: string = null;

  get f() { return this.oForm?.controls; }

  constructor(
    private oFormBuilder: FormBuilder,
    private oRouter: Router,
    private oCompraService: CompraService,
    private oFacturaService: FacturaService,
    private oServicioService: ServicioService,
    private oActivatedRoute: ActivatedRoute,
    private oRoute: ActivatedRoute,
    private oLocation: Location,
    private oDateTimeService: DateTimeService,
    public oIconService: IconService

  ) {

    if (this.oActivatedRoute.snapshot.data.message) {
      const strUsuarioSession: string = this.oActivatedRoute.snapshot.data.message.login;
      localStorage.setItem("user", JSON.stringify(this.oRoute.snapshot.data.message));
    } else {
      localStorage.clear();
      oRouter.navigate(['/home']);
    }

    this.id = this.oActivatedRoute.snapshot.params.id
    this.get();

  }

  ngOnInit(): void {

    $('#fecha').datetimepicker({
      defaultDate: "+1w",
      numberOfMonths: 1,
      dateFormat: 'dd/mm/yy',
      timeFormat: 'hh:mm',
      showAnim: "fold",
      onClose: (dateText: string, inst: any) => {
        this.oForm.controls['fecha'].setValue(dateText);
        this.oForm.controls['fecha'].markAsDirty();
      }
    });

  }

  get = (): void => {
    this.oCompraService.get(this.id).subscribe((oData: ICompra) => {

      this.oCompra = oData;
      this.oForm = this.oFormBuilder.group({
        id: [this.oCompra.id],
        cantidad: [this.oCompra.cantidad, Validators.required],
        precio: [this.oCompra.precio, Validators.required],
        fecha: [this.oCompra.fecha, Validators.required],
        servicio: [this.oCompra.servicio.id, Validators.required],
        factura: [this.oCompra.factura?.id]
      });
    })
  }

  onSubmit(): void {
    if (this.oForm) {
      if (this.oForm.get("factura")?.value == null) {

        this.oCompraToSend = {
          id: this.oForm.value.id,
          cantidad: this.oForm.value.cantidad,
          precio: this.oForm.value.precio,
          fecha: this.oForm.value.fecha.replace("-", "/").replace("-", "/"),
          servicio: {
            id: this.oForm.value.servicio
          },
          factura: null
        }
        console.log(this.oCompraToSend);
        this.update();
      } else {
        this.oCompraToSend = {
          id: this.oForm.value.id,
          cantidad: this.oForm.value.cantidad,
          precio: this.oForm.value.precio,
          fecha: this.oForm.value.fecha.replace("-", "/").replace("-", "/"),
          servicio: {
            id: this.oForm.value.servicio
          },
          factura: {
            id: this.oForm.get("factura")!.value
          }
        }

        console.log(this.oCompraToSend);
        this.update();
      }
    }
  }

  update = (): void => {
    this.oCompraService.update(this.oCompraToSend).subscribe((result: number) => {
      if (result) {
        this.strResult = "La compra se ha modificado correctamente";
      } else {
        this.strResult = "Error en la modificación de la compra";
      }
      this.openPopup();
    })
  }

  goBack(): void {
    this.oLocation.back();
  }

  //modal

  fila: IFactura;
  id_usuario: number = null;
  showingModalFactura: boolean = false;
  showingModalServicio: boolean = false;


  eventsSubjectShowModalFactura: Subject<void> = new Subject<void>();
  eventsSubjectHideModalFactura: Subject<void> = new Subject<void>();

  eventsSubjectShowModalServicio: Subject<void> = new Subject<void>();
  eventsSubjectHideModalServicio: Subject<void> = new Subject<void>();


  openModalFactura(): void {
    this.eventsSubjectShowModalFactura.next();
    this.showingModalFactura = true;
  }

  openModalServicio(): void {
    this.eventsSubjectShowModalServicio.next();
    this.showingModalServicio = true;
  }

  closeModalFactura(): void {
    this.eventsSubjectHideModalFactura.next();
    this.showingModalFactura = false;
  }

  closeModalServicio(): void {
    this.eventsSubjectHideModalServicio.next();
    this.showingModalServicio = false;
  }

  onSelectionFactura($event: any) {
    console.log("edit evento recibido: " + $event)
    this.oForm.controls['factura'].setValue($event);
  }

  onSelectionServicio($event: any) {
    console.log("edit evento recibido: " + $event)
    this.oForm.controls['servicio'].setValue($event);
  }

  onChangeFactura($event: any) {

    console.log("--->" + this.oForm.controls['factura'].value);
    this.oForm.controls['factura'].markAsDirty();

    //aqui cerrar la ventana emergente 
    if (this.showingModalFactura) {
      this.closeModalFactura();
    }

    //actualizar el usuario
    this.oFacturaService
      .getOne(this.oForm.controls['factura'].value)
      .subscribe((oData: IFactura) => {
        this.oCompra.factura = oData;
        //this.oUsuario = oData;
      });

    return false;
  }

  onChangeServicio($event: any) {

    console.log("--->" + this.oForm.controls['servicio'].value);
    this.oForm.controls['servicio'].markAsDirty();

    //aqui cerrar la ventana emergente 
    if (this.showingModalServicio) {
      this.closeModalServicio();
    }

    //actualizar el usuario
    this.oServicioService
      .get(this.oForm.controls['servicio'].value)
      .subscribe((oData: IServicio) => {
        this.oCompra.servicio = oData;
        //this.oUsuario = oData;
      });

    return false;
  }

  //popup

  eventsSubjectShowPopup: Subject<void> = new Subject<void>();

  openPopup(): void {
    this.eventsSubjectShowPopup.next();
  }

  onClosePopup(): void {
    this.oRouter.navigate([this.strEntity + '/view/' + this.id]);
  }

}
