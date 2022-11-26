package sara.tedwon;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
public class MemoResourceTest {

    @Test
    public void testHelloEndpoint() {
        given()
          .when().get("/memo")
          .then()
             .statusCode(200)
             .body(is("[{\"memo\":\"Pick up Sara at 2:45 pm\"}]"));
    }

}