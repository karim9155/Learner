import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService, User } from '../../../services/user.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-enroll-modal',
  standalone: false,
  templateUrl: './enroll-modal.component.html',
  styleUrls: ['./enroll-modal.component.css']
})
export class EnrollModalComponent implements OnInit {

  isSubmitting = false;
  displayedColumns: string[] = ['select', 'name', 'email', 'department', 'badgeNumber', 'phone'];
  dataSource = new MatTableDataSource<User>();
  selection = new SelectionModel<User>(true, []);
  departments: string[] = [];
  filteredUsers: User[] = [];
  cost = 0;
  credits = 0;

  constructor(
    public dialogRef: MatDialogRef<EnrollModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { courseId: string, courseName: string, credits: number },
    private userService: UserService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar
  ) {
    this.credits = data.credits;
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.userService.getEmployees(0, 1000, '').subscribe({
      next: (response: { content: User[] }) => {
        this.dataSource.data = response.content;
        const departmentSet = new Set(response.content.map(user => user.department));
        this.departments = Array.from(departmentSet);

        // Initialize the filter predicate
        this.dataSource.filterPredicate = (data: User, filter: string) => {
          return !filter || data.department === filter;
        };
      },
      error: (err) => {
        console.error('Failed to load employees for modal', err);
        this.snackBar.open('Could not load the employee list.', 'Close', { duration: 3000 });
      }
    });
  }

  onDepartmentChange(department: string): void {
    if (department) {
      this.dataSource.filter = department.trim().toLowerCase();
    } else {
      this.dataSource.filter = '';
    }
    this.selection.clear();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.filteredData.forEach(row => this.selection.select(row));
    }
    this.calculateCost();
  }

  calculateCost(): void {
    this.cost = this.selection.selected.length * 25;
  }

  onEnroll(): void {
    this.isSubmitting = true;
    const selectedLearnerIds = this.selection.selected.map(user => user.id);

    if (selectedLearnerIds.length === 0) {
      this.snackBar.open('Please select at least one employee.', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      return;
    }

    if (this.cost > this.credits) {
      this.snackBar.open('You do not have enough credits to enroll.', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      return;
    }

    this.enrollmentService.enrollUsersInCourse({ courseId: this.data.courseId, learnerIds: selectedLearnerIds })
      .subscribe({
        next: () => {
          this.snackBar.open('Enrollment successful!', 'Close', { duration: 3000 });
          this.dialogRef.close({ enrolled: true, cost: this.cost });
        },
        error: (err) => {
          this.snackBar.open('Enrollment failed. Please try again.', 'Close', { duration: 3000 });
          console.error(err);
          this.isSubmitting = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
