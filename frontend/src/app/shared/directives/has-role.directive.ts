import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { RoleService } from '../../core/services/role.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  @Input() set appHasRole(roles: string[]) {
    this.allowedRoles = roles;
    this.updateView();
  }

  private allowedRoles: string[] = [];
  private userRole: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.userRole = this.roleService.getCurrentRole();
    this.updateView();
  }

  private updateView(): void {
    if (this.allowedRoles.includes(this.userRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
