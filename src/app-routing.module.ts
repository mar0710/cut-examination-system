import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { AuthGuard } from './login/auth.guard';
import { UserListComponent } from '../src/user-list/user-list.component';
import { UserExaminationComponent } from '../src/user-examination/user-examination.component';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { QuestionManagerComponent } from './question-manager/question-manager.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserSummaryComponent } from './user-summary/user-summary.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'menu', component: MenuComponent },
      { path: 'user-list', component: UserListComponent },
      { path: 'user-examination', component: UserExaminationComponent },
      { path: 'questionManager', component: QuestionManagerComponent },
      { path: 'userDetails/:id', component: UserDetailsComponent },
      { path: 'userExamination/:id', component: UserExaminationComponent },
      { path: 'userList', component: UserListComponent },
      { path: 'userSummary/:id', component: UserSummaryComponent },
      { path: '', redirectTo: 'menu', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
