from sris_api.services.arxiv import build_arxiv_url, keyword_matches, parse_arxiv_feed


ATOM_FEED = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2501.00001v1</id>
    <updated>2025-01-01T00:00:00Z</updated>
    <published>2025-01-01T00:00:00Z</published>
    <title> Efficient Systems for Foundation Model Inference </title>
    <summary>
      We study scheduling and distributed systems for low-latency inference.
    </summary>
    <author><name>Ada Lovelace</name></author>
    <author><name>Grace Hopper</name></author>
    <link href="http://arxiv.org/abs/2501.00001v1" rel="alternate" type="text/html"/>
  </entry>
</feed>
"""


def test_parse_arxiv_feed_normalizes_entry() -> None:
    papers = parse_arxiv_feed(ATOM_FEED)

    assert len(papers) == 1
    assert papers[0].title == "Efficient Systems for Foundation Model Inference"
    assert papers[0].authors == ["Ada Lovelace", "Grace Hopper"]
    assert papers[0].url == "http://arxiv.org/abs/2501.00001v1"
    assert papers[0].published_at is not None


def test_keyword_matches_title_and_abstract() -> None:
    paper = parse_arxiv_feed(ATOM_FEED)[0]

    assert keyword_matches(paper, ["systems", "computer vision"]) == ["systems"]


def test_build_arxiv_url_escapes_query() -> None:
    url = build_arxiv_url("machine learning systems", max_results=10)

    assert "search_query=all:machine+learning+systems" in url
    assert "max_results=10" in url
