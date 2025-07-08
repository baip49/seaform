import { Routes } from '@angular/router';
import { FormComponent } from './form/form.component';
import { PantallaInicialComponent } from './pantalla-inicial/pantalla-inicial.component';

export const routes: Routes = [
  { path: '', component: PantallaInicialComponent },
  { path: 'form', component: FormComponent },
  { path: '**', redirectTo: '' },
];
