package com.finova.security.authorization;

import java.io.Serializable;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(
            Authentication authentication, Object targetDomainObject, Object permission) {
        if (targetDomainObject == null) {
            return checkAuthority(authentication, null, permission);
        }
        return checkAuthority(authentication, targetDomainObject.getClass().getSimpleName(), permission);
    }

    @Override
    public boolean hasPermission(
            Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return checkAuthority(authentication, targetType, permission);
    }

    private boolean checkAuthority(Authentication authentication, String targetType, Object permission) {
        if (authentication == null || !authentication.isAuthenticated() || permission == null) {
            return false;
        }

        String requiredPermission = (targetType != null ? targetType.toUpperCase() + "_" : "")
                + permission.toString().toUpperCase();

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (authority.getAuthority().equals(requiredPermission)) {
                return true;
            }
        }
        return false;
    }
}
