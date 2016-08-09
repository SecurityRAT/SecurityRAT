package org.appsec.securityRAT.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.pac4j.cas.logout.LogoutHandler;
import org.pac4j.core.context.WebContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AbstractAuthenticationTargetUrlRequestHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

public class CasLogoutSuccessHandler extends AbstractAuthenticationTargetUrlRequestHandler
			implements LogoutSuccessHandler {

	private String casLogoutUrl = "";
	
	@Override
	public void onLogoutSuccess(HttpServletRequest request,
			HttpServletResponse response, Authentication authentication)
			throws IOException, ServletException {
		
			response.sendRedirect(response.encodeRedirectURL(casLogoutUrl));
	}

	public String getCasLogoutUrl() {
		return casLogoutUrl;
	}

	public void setCasLogoutUrl(String casLogoutUrl) {
		this.casLogoutUrl = casLogoutUrl;
	}
	
}
