package org.appsec.securityRAT.web.rest;


import org.appsec.securityRAT.service.UserService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import javax.inject.Inject;
import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class AngularJSForwardController {
	
	@Inject
	private UserService userService;

	
    private final Logger log = LoggerFactory.getLogger(AngularJSForwardController.class);

    @RequestMapping(value = {"/audits*","/configuration*","/docs*","/apphealth*","/logs*","/appmetrics*",
                             "/error*","/accessdenied*", "/requirements","/collection*/**","/tag*/**","req*/**",
                             "opt*/**","status*/**","alternative*/**","projectTypes*/**", "/import*","/export*",
                             "/config*/**", "/user*/**", "/authorities*", "/login*", "/password*", "/reset*", "/logout*", "/register*"},
                              method = RequestMethod.GET)
    public void pageForward(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
    	String[] onlyForm = { "/login*", "/password*", "/reset*", "/logout*", "/register*"};
    	String permitRegistration = "/register*";
    	boolean formUri = false;
    	for (int i = 0; i < onlyForm.length; i++) {
    		if(httpRequest.getRequestURI().matches(onlyForm[i])) {
    			formUri = true;
    			break;
    		}
		}
    	if(userService.getAuthenticationType().equals("CAS") && formUri) {
			forward(httpRequest, httpResponse, true);
    	} else if(userService.getAuthenticationType().equals("FORM") && !userService.getRegistrationType() && httpRequest.getRequestURI().matches(permitRegistration)) {
    		forward(httpRequest, httpResponse, true);
    	} else {
    		forward(httpRequest, httpResponse, false);
    	}
    	
        
    }

    private void forward(HttpServletRequest httpRequest, HttpServletResponse httpResponse, boolean error) {
        RequestDispatcher dispatcher = httpRequest.getRequestDispatcher("/index.html");
        try {
        	if(!error)
        		dispatcher.forward(httpRequest, httpResponse);
        	else
        		httpResponse.sendError(httpResponse.SC_FORBIDDEN);
        } catch (Exception e) {
            log.error("Error forwarding request", e);
        }
    }
}
