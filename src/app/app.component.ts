import { Component, OnInit } from '@angular/core';
import { ClientsService } from './services/clients.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit {

  public empresa: string = ''
  public empresaBtn: boolean = false;
  public empresaId: string = '';
  public departamentos: any;
  public departamentoId: string = '';
  public empleados: any
  public existEmpleados: boolean = false

  public create: boolean = false;
  public clientId: string = '';

  public lidersName: string[] = [];



  //departamentos 
  departamento = {
    nombre: '',
    empresaId: '',
  };

  //empleado
  empleado = {
    name: '',
    empresaId: '',
    departamentoId: '',
    lider: false,
  };
  constructor(private cs: ClientsService) {
  }

  ngOnInit(): void {
    this.getEmpresa();
    this.getDeparments();
    this.getEmpleados();
  }
  async getEmpresa() {
    let values = {
    }
    await this.cs.index(values, 'empresa').toPromise()
      .then((res: any) => {
        if (res.data.length > 0) this.empresaBtn = true
        this.empresa = res.data[0].name
        this.empresaId = res.data[0]._id
      }).catch(err => console.log(err));
  }
  async getDeparments() {
    let values = {

    }
    await this.cs.index(values, 'departamento').toPromise()
      .then((res: any) => {
        this.departamentos = res.data
      }).catch(err => console.log(err));
  }
  async getEmpleados() {
    let values = {
    }
    await this.cs.index(values, 'empleado').toPromise()
      .then(async (res: any) => {
        if (res.data.length > 0) {
          this.existEmpleados = true
          this.empleados = res.data
          this.actualizarLideres()
          const departmentNamePromises = this.empleados.map((emp: any) => this.getDeparmentName(emp.departamentoId));
          const departmentNames = await Promise.all(departmentNamePromises);
          this.empleados.forEach(async (emp: any, index: any) => {
            emp.departamentoName = departmentNames[index];
            const res: any = await this.cs.show(emp.departamentoId, 'departamento').toPromise();
            const nombresLideres = await this.getNombresLideres(res.data.lideres);
            emp.lideres = nombresLideres
          });

          console.log(this.empleados);

        


        }
      }).catch(err => console.log(err));
  }
  async actualizarLideres() {
    // Filtra los empleados donde la propiedad lider sea true y obtiene un arreglo de los IDs
    this.departamentos.forEach((departamento: any) => {
      const lideresDepartamento = this.empleados
        .filter((empleado: any) => empleado.departamentoId == departamento.id && empleado.lider)
        .map((empleado: any) => empleado.id);

      departamento.lideres = lideresDepartamento;
    });

    for (let departamento of this.departamentos) {
      await this.cs.update(departamento.id, 'departamento', departamento).toPromise()
        .then((res) => {
        })
    }
    // Envía el arreglo de líderes al servicio para actualizar la tabla de departamentos
    // this.cs.actualizarLideresDepartamento(lideres).subscribe((res) => {
    //   console.log('Líderes actualizados en la tabla de departamentos:', res);
    // });
  }
  async getNombresLideres(ids: any[]) {
    const nombresPromesas = ids.map(async (id) => {
      const res: any = await this.cs.show(id, 'empleado').toPromise();
      console.log(res.data.name);
      return res.data.name;
    });
  
    return Promise.all(nombresPromesas);
  }
  async getDeparmentName(id: string) {
    try {
      const res: any = await this.cs.show(id, 'departamento').toPromise();

      return res.data.name;
    } catch (err) {
      console.log(err);
      // handle error if needed
      throw err;
    }
  }
  async openEmpleadoModal(accion: boolean, id?: string) {
    // Puedes usar la variable 'accion' para tomar decisiones en tu modal
    if (accion) {
      this.create = true;
    } else {
      this.create = false;
      this.clientId = id ? id : '';
      await this.cs.show(this.clientId, 'empleado').toPromise()
        .then((res: any) => {
          console.log(res.data);
          this.empleado = res.data
        })
      // this.cs.show()
    }

  }
  async createEmpresa() {
    let values = {
      name: 'Lexgo'

    }
    await this.cs.store(values, "empresa").toPromise()
      .then(async (res: any) => {
        console.log(res);
      }).catch((err) => { console.log(err + 'No se pudo crear el documento en mongo'); })

  }
  async createDepartamento() {
    console.log(this.departamento);
    let values = {
      id: 0,
      name: this.departamento.nombre,
      empresaId: this.empresaId

    }
    await this.cs.store(values, "departamento").toPromise()
      .then(async (res: any) => {
        console.log(res);
      }).catch((err) => { console.log(err + 'No se pudo crear el documento en mongo'); })

  }
  async createEmpleado() {
    if (this.create) {
      let values = {
        id: 0,
        name: this.empleado.name,
        departamentoId: this.empleado.departamentoId,
        empresaId: this.empresaId,
        lider: this.empleado.lider

      }
      await this.cs.store(values, "empleado").toPromise()
        .then(async (res: any) => {
          console.log(res);
          window.location.reload()
        }).catch((err) => { console.log(err + 'No se pudo crear el documento en mongo'); })
    } else {
      await this.cs.update(this.clientId, 'empleado', this.empleado).toPromise()
        .then((res) => {
          console.log(res);
          window.location.reload()
        });
    }


  }

  async eliminarEmpleado(id: string) {
    await this.cs.destroy(id).toPromise()
      .then((res) => {
        console.log(res);
        window.location.reload()
      })

  }
  toggleLider(event: any) {
    this.empleado.lider = event.target.checked;
  }
}
