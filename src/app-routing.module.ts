import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { QuestionManagerComponent } from './question-manager/question-manager.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserExaminationComponent } from './user-examination/user-examination.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserSummaryComponent } from './user-summary/user-summary.component';

const routes: Routes = [
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { path: 'questionManager', component: QuestionManagerComponent },
  { path: 'userDetails/:id', component: UserDetailsComponent },
  { path: 'userExamination/:id', component: UserExaminationComponent },
  { path: 'userList', component: UserListComponent },
  { path: 'userSummary/:id', component: UserSummaryComponent },
  { path: 'menu', component: MenuComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
