import { Routes } from '@angular/router';
import { FormComponent } from './form/form.component';
import { PantallaInicialComponent } from './pantalla-inicial/pantalla-inicial.component';
import { ListComponent } from './list/list.component';

export const routes: Routes = [
  {
    path: '',
    component: PantallaInicialComponent,
    data: { title: 'Pantalla Inicial' },
  },
  { path: 'form', component: FormComponent, data: { title: 'Formulario' } },
  {
    path: 'list',
    component: ListComponent,
    data: { title: 'Lista de Alumnos' },
  },
  { path: '**', redirectTo: '' },
];
