import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { RoleService } from '../../core/services/role.service';
import { Subject } from 'rxjs';

/**
 * Structural directive for role-based conditional rendering.
 * Hides elements from DOM if user doesn't have required roles.
 *
 * Usage:
 * <button *hasRole="'admin'">Admin Only</button>
 * <button *hasRole="['admin', 'manager']">Admins and Managers</button>
 * <div [hasRole]="requiredRoles" [hasRoleElse]="denialTemplate">
 *   <p>Authorized content</p>
 * </div>
 * <ng-template #denialTemplate>
 *   <p>Access Denied</p>
 * </ng-template>
 */
@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private roles: string[] = [];
  private elseTemplateRef: TemplateRef<any> | null = null;

  @Input()
  set hasRole(roles: string | string[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  @Input()
  set hasRoleElse(templateRef: TemplateRef<any>) {
    this.elseTemplateRef = templateRef;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const userRoles = this.roleService.getRoles();
    const hasAccess = this.roles.length === 0 || this.roles.some(role =>
      userRoles.some(userRole => userRole.toLowerCase() === role.toLowerCase())
    );

    this.viewContainer.clear();

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.elseTemplateRef) {
      this.viewContainer.createEmbeddedView(this.elseTemplateRef);
    }
  }
}
