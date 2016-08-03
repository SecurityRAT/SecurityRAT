package org.appsec.securityRAT.web.rest;

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class AngularJSForwardController {

    private final Logger log = LoggerFactory.getLogger(AngularJSForwardController.class);

    @RequestMapping(value = {"/audits*","/configuration*","/docs*","/apphealth*","/logs*","/appmetrics*",
                             "/error*","/accessdenied*", "/requirements","/collection*/**","/tag*/**","req*/**",
                             "opt*/**","status*/**","alternative*/**","projectTypes*/**", "/import*","/export*",
                             "/config*/**", "/user*/**", "/authorities*"},
                              method = RequestMethod.GET)
    public void pageForward(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        forward(httpRequest, httpResponse);
    }
    /**
     * Redirect the RequestMapping to root. This is needed because HTML5 mode is activated. This method is only generated when form login is activated.
     * @param httpRequest
     * @param httpResponse
     */
    @RequestMapping(value = {"/login*", "/register*", "/password*", "/reset*", "/logout*"}, method = RequestMethod.GET)
    @ConditionalOnExpression("environment.getProperty('authentication.type').equals('FORM')")
    public void addPageForward(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
    	forward(httpRequest, httpResponse);
    }

    private void forward(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        RequestDispatcher dispatcher = httpRequest.getRequestDispatcher("/index.html");
        try {
            dispatcher.forward(httpRequest, httpResponse);
        } catch (Exception e) {
            log.error("Error forwarding request", e);
        }
    }
}
