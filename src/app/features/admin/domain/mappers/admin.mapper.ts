import { AdminStateDTO, FeatureFlagDTO, RoleDTO, UserDTO } from '../dto/admin.dto';
import { AdminStateModel, FeatureFlag, Role, User } from '../models/admin.model';

export class AdminMapper {
  static toDomain(dto: AdminStateDTO): AdminStateModel {
    return {
      users: dto.users.map(this.userToDomain),
      roles: dto.roles.map(this.roleToDomain),
      featureFlags: dto.featureFlags.map(this.flagToDomain),
      currentUser: dto.currentUser ? this.userToDomain(dto.currentUser) : null
    };
  }

  static userToDomain(user: UserDTO): User {
    return { ...user };
  }

  static roleToDomain(role: RoleDTO): Role {
    return { ...role };
  }

  static flagToDomain(flag: FeatureFlagDTO): FeatureFlag {
    return { ...flag };
  }

  static toDTO(state: AdminStateModel): AdminStateDTO {
    return {
      users: state.users.map(u => ({ ...u })),
      roles: state.roles.map(r => ({ ...r })),
      featureFlags: state.featureFlags.map(f => ({ ...f })),
      currentUser: state.currentUser ? { ...state.currentUser } : null
    };
  }
}
