import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { QuestionManagerComponent } from './question-manager/question-manager.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserExaminationComponent } from './user-examination/user-examination.component';
import { UserSummaryComponent } from './user-summary/user-summary.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ElectronService } from 'ngx-electron';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { QuestionManagerService } from './question-manager/question-manager.service';
import { UserListService } from './user-list/user-list.service';
import { GradesService } from './grades.service';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './login/auth.guard';
import { AuthService } from './login/auth.service';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    QuestionManagerComponent,
    UserListComponent,
    UserDetailsComponent,
    UserExaminationComponent,
    UserSummaryComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    NgxCsvParserModule,
    FormsModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  providers: [
    ElectronService,
    QuestionManagerService,
    UserListService,
    GradesService,
    AuthService,
    AuthGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
