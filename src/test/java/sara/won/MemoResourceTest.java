package sara.won;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import javax.ws.rs.core.MediaType;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.containsInAnyOrder;

@QuarkusTest
public class MemoResourceTest {

    public static final String APP_URL = "/memo";


    @Test
    public void testGetEndpoint() {
        given()
          .when().get(APP_URL)
          .then()
             .statusCode(200)
             .body(is("[{\"memo\":\"Go to WESS this afternoon at 2:45 pm and meet Sara at the gate\",\"tags\":\"brisbane,family\",\"title\":\"Pick up Sara\"}]"));
    }

    @Test
    public void testSearchEndpoint() {
        given()
                .when().get(APP_URL + "/sara")
                .then()
                .statusCode(200)
                .body(is("[{\"memo\":\"Go to WESS this afternoon at 2:45 pm and meet Sara at the gate\",\"tags\":\"brisbane,family\",\"title\":\"Pick up Sara\"}]"));
    }

    @Test
    public void testCreateEndpoint() {
        given()
                .body("{\n" +
                        "  \"title\": \"My Title\",\n" +
                        "  \"memo\": \"My Memo\",\n" +
                        "  \"tags\": \"mytag,yourtag\"\n" +
                        "}")
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .when()
                .post(APP_URL)
                .then()
                .statusCode(200)
                .body("$.size()", is(2),
                        "title", containsInAnyOrder("My Title", "Pick up Sara"));
    }

    @Test
    public void testDeleteEndpoint() {
        given()
                .body("{\n" +
                        "  \"title\": \"My Title\",\n" +
                        "  \"memo\": \"My Memo\",\n" +
                        "  \"tags\": \"mytag,yourtag\"\n" +
                        "}")
                .header("Content-Type", MediaType.APPLICATION_JSON)
                .when()
                .delete(APP_URL)
                .then()
                .statusCode(200)
                .body("$.size()", is(1),
                        "title", containsInAnyOrder("Pick up Sara"));
    }

}