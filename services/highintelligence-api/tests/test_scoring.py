from app.pipeline.scoring import status_for, weighted_score, SCORING_VERSION

def test_status_mapping():
    assert status_for(88.7) == "build"
    assert status_for(70) == "validate"
    assert status_for(55) == "watch"
    assert status_for(40) == "ignore"

def test_weighted_score():
    f = {"demand": 90, "pain": 80, "wtp": 70, "competition": 60, "legal": 75, "automation": 50, "acquisition": 40}
    score = weighted_score(f)
    assert 60 <= score <= 80
    assert SCORING_VERSION == "v1"
