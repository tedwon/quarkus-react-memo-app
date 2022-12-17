package sara.tedwon;

import sara.tedwon.models.Memo;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Path("/memo")
@Consumes({MediaType.APPLICATION_JSON})
@Produces({MediaType.APPLICATION_JSON})
public class MemoResource {

    static final Set<Memo> MEMORY_DB = Collections.synchronizedSet(new HashSet<>());

    static {
        MEMORY_DB.add(new Memo("Pick up Sara", "Go to WESS this afternoon at 2:45 pm and meet Sara at the gate", "brisbane,family"));
    }

    @GET
    public Set<Memo> get() {
        return MEMORY_DB;
    }

    @POST
    @Path("contains")
    public Boolean contains(Memo memo) {
        return MEMORY_DB.contains(memo);
    }

    @GET
    @Path("{searchKeyword}")
    public Set<Memo> searchByKeyword(String searchKeyword) {
        final var wordToUpperCase = searchKeyword.toUpperCase();
        Set<Memo> resultNotes = Collections.synchronizedSet(new HashSet<>());
        MEMORY_DB.stream().forEach(memo -> {
            if (memo != null && (memo.title.toUpperCase().contains(wordToUpperCase)
                    || memo.memo.toUpperCase().contains(wordToUpperCase)
                    || memo.tags.toUpperCase().contains(wordToUpperCase))
            ) {
                resultNotes.add(memo);
            }
        });
        return resultNotes;
    }

    @POST
    public Set<Memo> create(Memo memo) {
        MEMORY_DB.add(memo);
        return MEMORY_DB;
    }

    @DELETE
    public Set<Memo> delete(Memo memo) {
        MEMORY_DB.remove(memo);
        return MEMORY_DB;
    }
}