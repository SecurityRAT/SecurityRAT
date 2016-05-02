package org.appsec.securityRAT.web.filter;
import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

@Component
public class SimpleCORSFilter implements Filter {

	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		HttpServletResponse response = (HttpServletResponse) res;
		//response.setHeader("Access-Control-Allow-Origin", "http://localhost:3002");
		//response.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
		//response.setHeader("Access-Control-Max-Age", "60");
		//response.setHeader("Access-Control-Allow-Headers", "x-requested-with, Content-Type");
		//response.setHeader("Access-Control-Allow-Credentials", "true");
		chain.doFilter(req, res);
	}

	public void init(FilterConfig filterConfig) {}

	public void destroy() {}
}
